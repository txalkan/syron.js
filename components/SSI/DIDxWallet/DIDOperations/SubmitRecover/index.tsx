import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import { useStore } from "effector-react";
import React from "react";
import { toast } from "react-toastify";
import { connect, ConnectedProps } from "react-redux";
import { $contract } from "../../../../../src/store/contract";
import { $donation, updateDonation } from "../../../../../src/store/donation";
import { decryptKey, operationKeyPair } from "../../../../../src/lib/dkms";
import { $arconnect } from "../../../../../src/store/arconnect";
import { $net } from "../../../../../src/store/wallet-network";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import { $doc } from "../../../../../src/store/did-doc";
import { $user } from "../../../../../src/store/user";
import { setTxStatusLoading, showTxStatusModal, setTxId } from "../../../../../src/app/actions"

const mapDispatchToProps = {
  dispatchLoading: setTxStatusLoading,
  dispatchShowTxStatusModal: showTxStatusModal,
  dispatchSetTxId: setTxId,
};

const connector = connect(null, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function Component(
  props: ModalProps,
  {
    services,
  }: {
    services: tyron.DocumentModel.ServiceModel[];
  }) {
  const { dispatchLoading, dispatchShowTxStatusModal, dispatchSetTxId } = props;
  const username = useStore($user)?.name;
  const donation = useStore($donation);
  const contract = useStore($contract);
  const dkms = useStore($doc)?.dkms;
  const arConnect = useStore($arconnect);
  const net = useStore($net);

  const handleSubmit = async () => {
    try {
      //@todo retrieve key ids from doc and reset all of them (check if any DID Domain key)
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
      ];

      if (arConnect !== null && contract !== null && donation !== null) {
        const verification_methods: tyron.TyronZil.TransitionValue[] = [];
        const doc_elements_: tyron.DocumentModel.DocumentElement[] = [];
        for (const service of services) {
          const doc_element: tyron.DocumentModel.DocumentElement = {
            constructor: tyron.DocumentModel.DocumentConstructor.Service,
            action: tyron.DocumentModel.Action.Add,
            service: service
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
        const donation_ = String(donation * 1e12);
        switch (donation) {
          case 0:
            tyron_ = await tyron.TyronZil.default.OptionParam(
              tyron.TyronZil.Option.none,
              "Uint128"
            );
            break;
          default:
            tyron_ = await tyron.TyronZil.default.OptionParam(
              tyron.TyronZil.Option.some,
              "Uint128",
              donation_
            );
            break;
        }

        const tx_params = await tyron.DidCrud.default.Recover({
          addr: contract.addr,
          verificationMethods: verification_methods,
          services: services,
          signature: signature,
          tyron_: tyron_,
        });

        toast.info(`You're about to submit a DID Recover transaction. Confirm with your DID Controller wallet.`, {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
        dispatchLoading(true);
        dispatchShowTxStatusModal();
        await zilpay
          .call(
            {
              contractAddress: contract.addr,
              transition: 'DidRecover',
              params: tx_params.txParams as unknown as Record<string, unknown>[],
              amount: String(donation),
            },
            {
              gasPrice: "2000",
              gaslimit: "20000",
            }
          )
          .then((res) => {
            updateDonation(null);
            dispatchSetTxId(res.ID);
            dispatchLoading(false);
            /**
             * @todo-checked wait a few seconds before opening the following window
             */
            setTimeout(() => {
              window.open(
                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
              );
            }, 3000);
            toast.info(`Wait for the transaction to get confirmed, and then access ${username}/did to see the changes.`, {
              position: "top-center",
              autoClose: 6000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'dark',
            });
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
        theme: 'dark',
      });
    }
  };

  return (
    <>
      {donation !== null &&
        <div style={{ marginTop: '14%', textAlign: 'center' }}>
          <button
            type="button"
            className="button"
            onClick={handleSubmit}
          >
            <strong style={{ color: '#ffff32' }}>recover did</strong>
          </button>
        </div>
      }
    </>
  );
}

export default Component;
