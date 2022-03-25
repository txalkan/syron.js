import React from "react";
import * as tyron from "tyron";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { connect, ConnectedProps } from "react-redux";
import { $contract } from "../../../../../src/store/contract";
import { $donation, updateDonation } from "../../../../../src/store/donation";
import { operationKeyPair } from "../../../../../src/lib/dkms";
import { $arconnect } from "../../../../../src/store/arconnect";
import { $net } from "../../../../../src/store/wallet-network";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import { $user } from "../../../../../src/store/user";
import { setTxStatusLoading, showTxStatusModal, setTxId } from "../../../../../src/app/actions"
import { useRouter } from "next/router";

const mapDispatchToProps = {
  dispatchLoading: setTxStatusLoading,
  dispatchShowTxStatusModal: showTxStatusModal,
  dispatchSetTxId: setTxId,
};

const connector = connect(null, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function Component(
  {
    services,
  }: {
    services: tyron.DocumentModel.ServiceModel[];
  },
  props: ModalProps) {
  const { dispatchLoading, dispatchShowTxStatusModal, dispatchSetTxId } = props;
  const Router = useRouter();
  const username = useStore($user)?.name;
  const donation = useStore($donation);
  const contract = useStore($contract);
  const arConnect = useStore($arconnect);
  const net = useStore($net);

  const handleSubmit = async () => {
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
      for (const input of key_input) {
        // Creates the cryptographic DID key pair
        const doc = await operationKeyPair({
          arConnect: arConnect,
          id: input.id,
          addr: contract.addr,
        });
        verification_methods.push(doc.parameter);
      }

      const zilpay = new ZilPayBase();
      toast.info(`You're about to submit a DID Update transaction. Confirm with your DID Controller wallet.`, {
        position: "top-center",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });

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

      const tx_params = await tyron.DidCrud.default.Create({
        addr: contract.addr,
        verificationMethods: verification_methods,
        services: services,
        tyron_: tyron_,
      });
      dispatchLoading(true);
      dispatchShowTxStatusModal();
      await zilpay
        .call(
          {
            contractAddress: contract.addr,
            transition: 'DidCreate',
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
          setTimeout(() => {
            window.open(
              `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
            );
            Router.push(`/${username}/did`);
          }, 5000);
        });
    }
  };

  return (
    <>
      {donation !== null && (
        <div style={{ marginTop: '14%', textAlign: 'center' }}>
          <button
            className="button"
            onClick={handleSubmit}
          >
            <strong style={{ color: '#ffff32' }}>create did</strong>
          </button>
          <h5 style={{ marginTop: '3%' }}>around 7 ZIL</h5>
        </div>
      )}
    </>
  );
}

export default Component;
