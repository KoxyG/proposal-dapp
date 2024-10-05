import { useCallback } from "react";
import { toast } from "react-toastify";
import useContract from "./useContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitNetwork } from "@reown/appkit/react";
import { liskSepoliaNetwork } from "../connection";
import { ErrorDecoder } from "ethers-decode-error";

const useVote = () => {
  const contract = useContract(true);
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  const errorDecoder = ErrorDecoder.create();
  return useCallback(
    async (proposalId) => {
      if (!address) {
        toast.error("Connect your wallet!");
        return;
      }
      if (Number(chainId) !== liskSepoliaNetwork.chainId) {
        toast.error("You are not connected to the right network");
        return;
      }

      if (!contract) {
        toast.error("Cannot get contract!");
        return;
      }
      try {
        const estimatedGas = await contract.vote.estimateGas(proposalId);
        const tx = await contract.vote(proposalId, {
          gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
        });
        const reciept = await tx.wait();

        if (reciept.status === 1) {
          toast.success("Proposal vote successful");
          return;
        }
        toast.error("Proposal VOte failed");
        return;
      } catch (error) {
        const { reason } = await errorDecoder.decode(error);

        toast.error(reason);
      }
    },
    [address, chainId, contract, errorDecoder]
  );
};

export default useVote;