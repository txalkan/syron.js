import React, { ReactNode } from "react";
import { useStore } from "effector-react";
import { $user } from "../../../src/store/user";
import { $arconnect } from "../../../src/store/arconnect";
import { useRouter } from "next/router";
import { Headline } from "../..";
import styles from "./styles.module.scss";

/*
import * as tyron from 'tyron';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $net } from 'src/store/wallet-network';
import { $contract } from 'src/store/contract';
*/

interface LayoutProps {
  children: ReactNode;
}

function Component(props: LayoutProps) {
  const { children } = props;
  const Router = useRouter();

  const username = useStore($user)?.name;
  const arConnect = useStore($arconnect);

  //const contract = useStore($contract);
  //const net = useStore($net);
  //const [error, setError] = useState('');

  /*
      const handleTest = async () => {
          if (contract !== null) {
              try {
                  const zilpay = new ZilPayBase();
                  const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');
  
                  const username = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'String', user?.nft);
                  const input = "0xf17c14ca06322e8fe4f460965a94184eb008b2c4"   //@todo-test beneficiary
                  const guardianship = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'ByStr20', input);
                  const id = "tyron";
  
                  const tx_value = [
                      {
                          "argtypes": [
                              "String",
                              "Uint128"
                          ],
                          "arguments": [
                              `${"tyron"}`,
                              `${9}`
                          ],
                          "constructor": "Pair"
                      },
                      {
                          "argtypes": [
                              "String",
                              "Uint128"
                          ],
                          "arguments": [
                              `${"xsgd"}`,
                              `${1000000}`
                          ],
                          "constructor": "Pair"
                      }
                  ];
                  const params = [];
                  const username_ = {
                      vname: 'username',
                      type: 'Option String',
                      value: username,
                  };
                  params.push(username_);
                  const addr_ = {
                      vname: 'recipient',
                      type: 'ByStr20',
                      value: input,
                  };
                  params.push(addr_);
                  const guardianship_ = {
                      vname: 'guardianship',
                      type: 'Option ByStr20',
                      value: guardianship,
                  };
                  params.push(guardianship_);
                  const id_ = {
                      vname: 'id',
                      type: 'String',
                      value: id,
                  };
                  params.push(id_);
                  const amount_ = {
                      vname: 'amount',
                      type: 'Uint128',
                      value: '0',   //0 because ID is tyron
                  };
                  params.push(amount_);
                  const tokens_ = {
                      vname: 'tokens',
                      type: 'List( Pair String Uint128 )',
                      value: tx_value,
                  };
                  params.push(tokens_);
                  const tyron__ = {
                      vname: 'tyron',
                      type: 'Option Uint128',
                      value: tyron_,
                  };
                  params.push(tyron__);
                  await zilpay.call(
                      {
                          contractAddress: contract.addr,
                          transition: 'Upgrade',
                          params: params as unknown as Record<string, unknown>[],
                          amount: String(0)
                      },
                      {
                          gasPrice: '2000',
                          gaslimit: '20000'
                      }
                  )
                      .then(res => {
                          window.open(
                              `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                          );
                      })
              } catch (error) {
                  const err = error as string;
                  setError(err)
              }
          } else {
              setError('some data is missing.')
          }
      };
      */

  return (
    <div
      style={{
        textAlign: "center",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}

export default Component;
