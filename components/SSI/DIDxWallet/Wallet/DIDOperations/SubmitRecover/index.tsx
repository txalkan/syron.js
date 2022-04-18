import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import { useStore } from "effector-react";
import React from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { HTTPProvider } from "@zilliqa-js/core";
import { Transaction } from "@zilliqa-js/account";
import { BN, Long } from "@zilliqa-js/util";
import { randomBytes, toChecksumAddress } from "@zilliqa-js/crypto";
import { $contract } from "../../../../../../src/store/contract";
import {
  $donation,
  updateDonation,
} from "../../../../../../src/store/donation";
import { decryptKey, operationKeyPair } from "../../../../../../src/lib/dkms";
import { $arconnect } from "../../../../../../src/store/arconnect";
import { $net } from "../../../../../../src/store/wallet-network";
import { ZilPayBase } from "../../../../../ZilPay/zilpay-base";
import { $doc } from "../../../../../../src/store/did-doc";
import { $user } from "../../../../../../src/store/user";
import {
  setTxStatusLoading,
  showTxStatusModal,
  setTxId,
  hideTxStatusModal,
} from "../../../../../../src/app/actions";
import { useRouter } from "next/router";

function Component({
  services,
}: {
  services: tyron.DocumentModel.ServiceModel[];
}) {
  const Router = useRouter();
  const dispatch = useDispatch();
  const username = useStore($user)?.name;
  const donation = useStore($donation);
  const contract = useStore($contract);
  const dkms = useStore($doc)?.dkms;
  const arConnect = useStore($arconnect);
  const net = useStore($net);
  const doc = useStore($doc)?.doc;

  const handleSubmit = async () => {
    try {
      //@todo-checked retrieve key ids from doc and reset all of them (check if any DID Domain key)
      let key_domain = Array();
      const vc = doc?.filter(
        (val) => val[0] === "verifiable-credential key"
      ) as any;
      const dex = doc?.filter(
        (val) => val[0] === "decentralized-exchange key"
      ) as any;
      const stake = doc?.filter((val) => val[0] === "staking key") as any;
      if (vc?.length > 1) {
        const id = { id: "verifiable-credential key" };
        key_domain.push(id);
      }
      if (dex?.length > 1) {
        const id = { id: "decentralized-exchange key" };
        key_domain.push(id);
      }
      if (stake?.length > 1) {
        const id = { id: "staking key" };
        key_domain.push(id);
      }
      const key_input = [
        {
          id: tyron.VerificationMethods.PublicKeyPurpose.SocialRecovery,
        },
        {
          id: tyron.VerificationMethods.PublicKeyPurpose.General,
        },
        {
          id: tyron.VerificationMethods.PublicKeyPurpose.Auth,
        },
        {
          id: tyron.VerificationMethods.PublicKeyPurpose.Assertion,
        },
        {
          id: tyron.VerificationMethods.PublicKeyPurpose.Agreement,
        },
        {
          id: tyron.VerificationMethods.PublicKeyPurpose.Invocation,
        },
        {
          id: tyron.VerificationMethods.PublicKeyPurpose.Delegation,
        },
        {
          id: tyron.VerificationMethods.PublicKeyPurpose.Update,
        },
        {
          id: tyron.VerificationMethods.PublicKeyPurpose.Recovery,
        },
        ...key_domain,
      ];

      if (arConnect !== null && contract !== null && donation !== null) {
        const verification_methods: tyron.TyronZil.TransitionValue[] = [];
        const doc_elements_: tyron.DocumentModel.DocumentElement[] = [];
        for (const service of services) {
          const doc_element: tyron.DocumentModel.DocumentElement = {
            constructor: tyron.DocumentModel.DocumentConstructor.Service,
            action: tyron.DocumentModel.Action.Add,
            service: service,
          };
          doc_elements_.push(doc_element);
        }
        for (const input of key_input) {
          // Creates the cryptographic DID key pair
          const doc = await operationKeyPair({
            arConnect: arConnect,
            id: input.id,
            addr: contract.addr,
          });
          doc_elements_.push(doc.element);
          verification_methods.push(doc.parameter);
        }

        const zilpay = new ZilPayBase();

        const hash = await tyron.DidCrud.default.HashDocument(doc_elements_);
        const encrypted_key = dkms.get("recovery");
        const private_key = await decryptKey(arConnect, encrypted_key);
        const public_key = zcrypto.getPubKeyFromPrivateKey(private_key);
        const signature = zcrypto.sign(
          Buffer.from(hash, "hex"),
          private_key,
          public_key
        );

        let tyron_: tyron.TyronZil.TransitionValue;
        tyron_ = await tyron.Donation.default.tyron(donation);

        const tx_params = await tyron.DidCrud.default.Recover({
          addr: contract.addr,
          verificationMethods: verification_methods,
          services: services,
          signature: signature,
          tyron_: tyron_,
        });

        dispatch(setTxStatusLoading("true"));
        dispatch(showTxStatusModal());
        const generateChecksumAddress = () =>
          toChecksumAddress(randomBytes(20));
        let tx = new Transaction(
          {
            version: 0,
            toAddr: generateChecksumAddress(),
            amount: new BN(0),
            gasPrice: new BN(1000),
            gasLimit: Long.fromNumber(1000),
          },
          new HTTPProvider("https://dev-api.zilliqa.com/")
        );

        toast.info(
          `You're about to submit a DID Recover transaction!`,
          {
            position: "top-center",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );
        await zilpay
          .call(
            {
              contractAddress: contract.addr,
              transition: "DidRecover",
              params: tx_params.txParams as unknown as Record<
                string,
                unknown
              >[],
              amount: String(donation),
            },
            {
              gasPrice: "2000",
              gaslimit: "20000",
            }
          )
          .then(async (res) => {
            dispatch(setTxId(res.ID));
            dispatch(setTxStatusLoading("submitted"));
            try {
              tx = await tx.confirm(res.ID);
              if (tx.isConfirmed()) {
                dispatch(setTxStatusLoading("confirmed"));
                updateDonation(null);
                window.open(
                  `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                );
                Router.push(`/${username}/did/doc`);
              } else if (tx.isRejected()) {
                dispatch(hideTxStatusModal());
                dispatch(setTxStatusLoading("idle"));
                setTimeout(() => {
                  toast.error("Transaction failed.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                  });
                }, 1000);
              }
            } catch (err) {
              dispatch(hideTxStatusModal());
              throw err;
            }
          })
          .catch((err) => {
            dispatch(hideTxStatusModal());
            throw err;
          });
      }
    } catch (error) {
      toast.error(`${error}`, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <>
      {donation !== null && (
        <div style={{ marginTop: "14%", textAlign: "center" }}>
          <button type="button" className="button" onClick={handleSubmit}>
            <strong style={{ color: "#ffff32" }}>recover did</strong>
          </button>
        </div>
      )}
    </>
  );
}

export default Component;
