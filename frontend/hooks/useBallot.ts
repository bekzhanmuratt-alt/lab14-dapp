"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, Eip1193Provider } from "ethers";
import { BALLOT_ABI } from "@/lib/ballotAbi";
import { bytes32ToText } from "@/lib/utils";

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      on?: (event: string, listener: (...args: any[]) => void) => void;
      removeListener?: (event: string, listener: (...args: any[]) => void) => void;
      request?: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
    };
  }
}

type Proposal = {
  index: number;
  name: string;
  voteCount: number;
};

type TxState = {
  type: "idle" | "pending" | "success" | "error";
  message: string;
};

type VoterStatus = {
  weight: number;
  voted: boolean;
  delegatedTo: string;
  votedProposal: number;
};

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "97");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useBallot() {
  const [mounted, setMounted] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [chairperson, setChairperson] = useState<string>("");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [winner, setWinner] = useState<string>("");
  const [voterStatus, setVoterStatus] = useState<VoterStatus | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [txState, setTxState] = useState<TxState>({ type: "idle", message: "Ожидание действия пользователя" });

  useEffect(() => {
    setMounted(true);
    setHasWallet(typeof window !== "undefined" && !!window.ethereum);
  }, []);

  const providerPromise = useMemo(() => {
    if (!mounted || !hasWallet || !window.ethereum) return null;
    return Promise.resolve(new BrowserProvider(window.ethereum));
  }, [mounted, hasWallet]);

  const getWriteContract = useCallback(async () => {
    if (!providerPromise || !CONTRACT_ADDRESS) throw new Error("Contract is not configured");
    const provider = await providerPromise;
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, BALLOT_ABI, signer);
  }, [providerPromise]);

  const loadData = useCallback(
    async (selectedAccount?: string) => {
      if (!mounted) return;

      if (!providerPromise || !CONTRACT_ADDRESS) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const provider = await providerPromise;
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));

        const contract = new Contract(CONTRACT_ADDRESS, BALLOT_ABI, provider);
        const currentChairperson = await contract.chairperson();
        setChairperson(currentChairperson);

        const proposalsCount = Number(await contract.getProposalsCount());
        const proposalList: Proposal[] = [];

        for (let i = 0; i < proposalsCount; i++) {
          const [name, voteCount] = await contract.getProposal(i);
          proposalList.push({
            index: i,
            name: bytes32ToText(name),
            voteCount: Number(voteCount),
          });
        }
        setProposals(proposalList);

        const winnerBytes = await contract.winnerName();
        setWinner(bytes32ToText(winnerBytes));

        const addressToCheck = selectedAccount || account;
        if (addressToCheck) {
          const [weight, voted, delegatedTo, votedProposal] = await contract.getVoterStatus(addressToCheck);
          setVoterStatus({
            weight: Number(weight),
            voted: Boolean(voted),
            delegatedTo,
            votedProposal: Number(votedProposal),
          });
        } else {
          setVoterStatus(null);
        }
      } catch (error) {
        setTxState({
          type: "error",
          message: normalizeError(error),
        });
      } finally {
        setLoading(false);
      }
    },
    [account, mounted, providerPromise]
  );

  const connectWallet = useCallback(async () => {
    if (!mounted || !window.ethereum) {
      setTxState({ type: "error", message: "MetaMask не найден. Установите расширение браузера." });
      return;
    }

    try {
      const accounts = (await window.ethereum.request?.({ method: "eth_requestAccounts" })) as string[];
      const address = accounts?.[0] || "";
      setAccount(address);
      setTxState({ type: "success", message: "Кошелек успешно подключен." });
      await loadData(address);
    } catch (error) {
      setTxState({ type: "error", message: normalizeError(error) });
    }
  }, [loadData, mounted]);

  const switchNetworkIfNeeded = useCallback(async () => {
    if (!window.ethereum) return;
    const hexChain = `0x${TARGET_CHAIN_ID.toString(16)}`;

    try {
      await window.ethereum.request?.({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChain }],
      });
    } catch (error: any) {
      if (error?.code === 4902) {
        await window.ethereum.request?.({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChain,
              chainName: "BNB Smart Chain Testnet",
              nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
              rpcUrls: ["https://data-seed-prebsc-1-s1.bnbchain.org:8545"],
              blockExplorerUrls: ["https://testnet.bscscan.com"],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }, []);

  const runTx = useCallback(
    async (handler: () => Promise<void>) => {
      try {
        setTxState({ type: "pending", message: "Транзакция отправлена. Ожидание подтверждения..." });
        await switchNetworkIfNeeded();
        await handler();
        setTxState({ type: "success", message: "Транзакция успешно подтверждена." });
        await loadData();
      } catch (error) {
        setTxState({ type: "error", message: normalizeError(error) });
      }
    },
    [loadData, switchNetworkIfNeeded]
  );

  const giveRightToVote = useCallback(
    async (voter: string) => {
      await runTx(async () => {
        const contract = await getWriteContract();
        const tx = await contract.giveRightToVote(voter);
        await tx.wait();
      });
    },
    [getWriteContract, runTx]
  );

  const delegateVote = useCallback(
    async (to: string) => {
      await runTx(async () => {
        const contract = await getWriteContract();
        const tx = await contract.delegate(to);
        await tx.wait();
      });
    },
    [getWriteContract, runTx]
  );

  const vote = useCallback(
    async (proposalIndex: number) => {
      await runTx(async () => {
        const contract = await getWriteContract();
        const tx = await contract.vote(proposalIndex);
        await tx.wait();
      });
    },
    [getWriteContract, runTx]
  );

  useEffect(() => {
    if (!mounted) return;

    if (!window.ethereum) {
      setHasWallet(false);
      setLoading(false);
      return;
    }

    setHasWallet(true);

    const provider = new BrowserProvider(window.ethereum);

    provider.listAccounts().then(async (accounts) => {
      if (accounts.length > 0) {
        const address = accounts[0].address;
        setAccount(address);
        await loadData(address);
      } else {
        await loadData();
      }
    });

    const handleAccountsChanged = (accounts: string[]) => {
      const next = accounts?.[0] || "";
      setAccount(next);
      loadData(next);
    };

    const handleChainChanged = async () => {
      await loadData();
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [mounted, loadData]);

  const isChairperson = account && chairperson && account.toLowerCase() === chairperson.toLowerCase();
  const hasVotingRight = (voterStatus?.weight || 0) > 0;
  const isCorrectNetwork = chainId === TARGET_CHAIN_ID;
  const hasDelegated = !!(voterStatus?.delegatedTo && voterStatus.delegatedTo !== ZERO_ADDRESS);

  return {
    mounted,
    account,
    chairperson,
    proposals,
    winner,
    voterStatus,
    chainId,
    loading,
    hasWallet,
    isChairperson,
    hasVotingRight,
    isCorrectNetwork,
    hasDelegated,
    txState,
    connectWallet,
    giveRightToVote,
    delegateVote,
    vote,
    refresh: loadData,
  };
}

function normalizeError(error: unknown): string {
  const fallback = "Произошла ошибка при выполнении операции.";
  if (!error) return fallback;
  if (typeof error === "string") return error;

  const err = error as any;
  return err?.shortMessage || err?.reason || err?.info?.error?.message || err?.message || fallback;
}
