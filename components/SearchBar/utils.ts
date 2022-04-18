import * as tyron from "tyron";
import { toast } from "react-toastify";

export const isValidUsername = (username: string) =>
  (/^[\w\d_]+$/.test(username) && username.length > 5) ||
  username === "init" ||
  username === "tyron" ||
  username === "donate" ||
  username === "wfp";

export const isAdminUsername = (username: string) =>
  username === "init" ||
  username === "tyron" ||
  username === "donate" ||
  username === "wfp";

export const fetchAddr = async ({
  net,
  _username,
  _domain,
}: {
  net: string;
  _username: string;
  _domain: string;
}) => {
  let network = tyron.DidScheme.NetworkNamespace.Mainnet;
  let init_tyron = "0x3c3c3013929c4fa1d4de0747ab7bbbb516712db5"; //@todo-x
  if (net === "testnet") {
    network = tyron.DidScheme.NetworkNamespace.Testnet;
    init_tyron = "0x1c69d3eba6a2db8552464ee52798140ce6e397bd";
  }
  const addr = await tyron.Resolver.default
    .resolveDns(network, init_tyron, _username, _domain)
    .catch((err) => {
      throw err;
    });
  return addr;
};

export const resolve = async ({ net, addr }: { net: string; addr: string }) => {
  let network = tyron.DidScheme.NetworkNamespace.Mainnet;
  if (net === "testnet") {
    network = tyron.DidScheme.NetworkNamespace.Testnet;
  }
  const did_doc: any[] = [];
  const state = await tyron.State.default.fetch(network, addr);

  let did: string;
  if (state.did == "") {
    did = "Not activated yet.";
  } else {
    did = state.did;
  }
  did_doc.push(["Decentralized identifier", did]);

  const controller = state.controller;

  if (state.services_ && state.services_?.size !== 0) {
    const services = Array();
    for (const id of state.services_.keys()) {
      const result = state.services_.get(id);
      if (result && result[1] !== "") {
        services.push([id, result[1]]);
      }
    }
    did_doc.push(["DID services", services]);
  }

  if (state.verification_methods) {
    if (state.verification_methods.get("socialrecovery")) {
      did_doc.push([
        "social-recovery key",
        [state.verification_methods.get("socialrecovery")],
      ]);
    }
    if (state.verification_methods.get("dex")) {
      did_doc.push([
        "decentralized-exchange key",
        [state.verification_methods.get("dex")],
      ]);
    }
    if (state.verification_methods.get("stake")) {
      did_doc.push(["staking key", [state.verification_methods.get("stake")]]);
    }
    if (state.verification_methods.get("general")) {
      did_doc.push([
        "general-purpose key",
        [state.verification_methods.get("general")],
      ]);
    }
    if (state.verification_methods.get("authentication")) {
      did_doc.push([
        "authentication key",
        [state.verification_methods.get("authentication")],
      ]);
    }
    if (state.verification_methods.get("assertion")) {
      did_doc.push([
        "assertion key",
        [state.verification_methods.get("assertion")],
      ]);
    }
    if (state.verification_methods.get("agreement")) {
      did_doc.push([
        "agreement key",
        [state.verification_methods.get("agreement")],
      ]);
    }
    if (state.verification_methods.get("invocation")) {
      did_doc.push([
        "invocation key",
        [state.verification_methods.get("invocation")],
      ]);
    }
    if (state.verification_methods.get("delegation")) {
      did_doc.push([
        "delegation key",
        [state.verification_methods.get("delegation")],
      ]);
    }
    if (state.verification_methods.get("vc")) {
      did_doc.push([
        "verifiable-credential key",
        [state.verification_methods.get("vc")],
      ]);
    }
  }

  const init = new tyron.ZilliqaInit.default(network);

  let guardians: any[] = [];
  try {
    const social_recovery = await init.API.blockchain.getSmartContractSubState(
      addr,
      "social_guardians"
    );
    guardians = await resolveSubState(social_recovery.result.social_guardians);
  } catch (error) {
    toast.warning("No social guardians found", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    // throw new Error("no social guardians found");
  }

  let version: any = "0";
  try {
    await init.API.blockchain
      .getSmartContractSubState(addr, "version")
      .then((substate) => {
        if (substate.result !== null) {
          version = substate.result.version as string;

          if (Number(version.slice(8, 9)) < 5) {
            console.log("Upgrade required: deploy a new SSI.");
            // @todo-i the following error is not popping up as a warning for tyronmapu
            throw new Error("Upgrade required: deploy a new SSI.");

          }
        } else {
          throw new Error("Upgrade required: deploy a new SSI.");
        }
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    toast.warning(String(error), {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }
  return {
    did: did,
    version: version,
    status: state.did_status,
    controller: controller,
    doc: did_doc,
    dkms: state.dkms,
    guardians: guardians,
  };
};

export async function resolveSubState(object: any): Promise<any[]> {
  const entries = Object.entries(object);
  const result: any[] = [];
  entries.forEach((value: [string, unknown]) => {
    result.push(value[0]);
  });
  return result;
}
