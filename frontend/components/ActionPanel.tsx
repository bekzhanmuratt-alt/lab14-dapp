"use client";

import { FormEvent, useState } from "react";
import styles from "./ActionPanel.module.css";

type ProposalOption = {
  index: number;
  name: string;
};

type ActionPanelProps = {
  isChairperson: boolean;
  hasVotingRight: boolean;
  canVote: boolean;
  proposalOptions: ProposalOption[];
  onGrant: (address: string) => Promise<void> | void;
  onDelegate: (address: string) => Promise<void> | void;
  onVote: (proposalIndex: number) => Promise<void> | void;
};

export function ActionPanel({
  isChairperson,
  hasVotingRight,
  canVote,
  proposalOptions,
  onGrant,
  onDelegate,
  onVote,
}: ActionPanelProps) {
  const [grantAddress, setGrantAddress] = useState("");
  const [delegateAddress, setDelegateAddress] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(
    proposalOptions[0]?.index ?? 0
  );

  const submitGrant = async (e: FormEvent) => {
    e.preventDefault();
    if (!grantAddress.trim()) return;
    await onGrant(grantAddress.trim());
    setGrantAddress("");
  };

  const submitDelegate = async (e: FormEvent) => {
    e.preventDefault();
    if (!delegateAddress.trim()) return;
    await onDelegate(delegateAddress.trim());
    setDelegateAddress("");
  };

  const submitVote = async (e: FormEvent) => {
    e.preventDefault();
    await onVote(Number(selectedProposal));
  };

  return (
    <div className={styles.grid}>
      <form className={styles.card} onSubmit={submitGrant}>
        <div className={styles.tag}>Только для chairperson</div>
        <h3 className={styles.title}>Выдать право голоса</h3>
        <p className={styles.text}>
          Укажите адрес кошелька, которому нужно разрешить участие в голосовании.
        </p>
        <input
          className={styles.input}
          value={grantAddress}
          onChange={(e) => setGrantAddress(e.target.value)}
          placeholder="0x..."
          disabled={!isChairperson}
        />
        <button className={styles.button} type="submit" disabled={!isChairperson}>
          Выдать право
        </button>
      </form>

      <form className={styles.card} onSubmit={submitDelegate}>
        <div className={styles.tag}>Для избирателя</div>
        <h3 className={styles.title}>Делегирование</h3>
        <p className={styles.text}>
          Передайте свой голос другому адресу, если не хотите голосовать самостоятельно.
        </p>
        <input
          className={styles.input}
          value={delegateAddress}
          onChange={(e) => setDelegateAddress(e.target.value)}
          placeholder="0x..."
          disabled={!hasVotingRight}
        />
        <button className={styles.button} type="submit" disabled={!hasVotingRight}>
          Делегировать
        </button>
      </form>

      <form className={styles.card} onSubmit={submitVote}>
        <div className={styles.tag}>Основное действие</div>
        <h3 className={styles.title}>Голосование</h3>
        <p className={styles.text}>
          Выберите кандидата и отправьте транзакцию в сеть BNB Smart Chain Testnet.
        </p>
        <select
          className={styles.select}
          value={selectedProposal}
          onChange={(e) => setSelectedProposal(Number(e.target.value))}
          disabled={!canVote || proposalOptions.length === 0}
        >
          {proposalOptions.map((proposal) => (
            <option key={proposal.index} value={proposal.index}>
              {proposal.name}
            </option>
          ))}
        </select>
        <button className={styles.button} type="submit" disabled={!canVote || proposalOptions.length === 0}>
          Отправить голос
        </button>
      </form>
    </div>
  );
}
