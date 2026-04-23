"use client";

import styles from "./page.module.css";
import { ActionPanel } from "@/components/ActionPanel";
import { ProposalCard } from "@/components/ProposalCard";
import { StatusBanner } from "@/components/StatusBanner";
import { useBallot } from "@/hooks/useBallot";
import { shortAddress } from "@/lib/utils";

export default function HomePage() {
  const {
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
    refresh,
  } = useBallot();

  const canVote = mounted && hasVotingRight && !voterStatus?.voted && !hasDelegated;

  const statusLabel = !mounted
    ? "Проверка..."
    : !hasWallet
    ? "MetaMask отсутствует"
    : !isCorrectNetwork
    ? "Неверная сеть"
    : voterStatus?.voted
    ? "Голос уже использован"
    : hasDelegated
    ? "Голос делегирован"
    : "Можно голосовать";

  return (
    <main className={styles.page}>
      <div className={styles.aurora} />
      <div className={styles.gridGlow} />

      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <span className={styles.kicker}>Лабораторная работа №14</span>
            <h1 className={styles.title}>Ballot dApp</h1>
            <p className={styles.subtitle}>
              Децентрализованное приложение для голосования в зелёной теме. Интерфейс показывает
              кандидатов, статус пользователя, победителя и позволяет выполнять действия через MetaMask.
            </p>

            <div className={styles.heroButtons}>
              <button className={styles.primaryButton} onClick={connectWallet}>
                {account ? "Кошелек подключен" : "Подключить MetaMask"}
              </button>
              <button className={styles.secondaryButton} onClick={() => refresh()}>
                Обновить данные
              </button>
            </div>
          </div>

          <aside className={styles.heroSide}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Текущий победитель</div>
              <div className={styles.metricValue}>{winner || "—"}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Кандидатов</div>
              <div className={styles.metricValue}>{proposals.length}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Chain ID</div>
              <div className={styles.metricValue}>{mounted ? chainId ?? "—" : "—"}</div>
            </div>
          </aside>
        </section>

        <StatusBanner type={txState.type} message={loading ? "Загрузка данных контракта..." : txState.message} />

        <section className={styles.statusCard}>
          <div className={styles.sectionTop}>
            <div>
              <h2 className={styles.sectionTitle}>Панель участника</h2>
              <p className={styles.sectionText}>
                Информация считывается напрямую из контракта Ballot.
              </p>
            </div>
            <div className={styles.badge}>
              {mounted && isChairperson ? "Chairperson" : "Voter"}
            </div>
          </div>

          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span>Аккаунт</span>
              <strong>{account ? shortAddress(account) : "Не подключен"}</strong>
            </div>
            <div className={styles.statusItem}>
              <span>Chairperson</span>
              <strong>{chairperson ? shortAddress(chairperson) : "—"}</strong>
            </div>
            <div className={styles.statusItem}>
              <span>Права голоса</span>
              <strong>{mounted ? (hasVotingRight ? "Есть" : "Нет") : "Проверка..."}</strong>
            </div>
            <div className={styles.statusItem}>
              <span>Состояние</span>
              <strong>{statusLabel}</strong>
            </div>
          </div>
        </section>

        <section className={styles.listSection}>
          <div className={styles.sectionTop}>
            <div>
              <h2 className={styles.sectionTitle}>Список кандидатов</h2>
              <p className={styles.sectionText}>
                Выберите одного из кандидатов для голосования.
              </p>
            </div>
          </div>

          <div className={styles.proposalsGrid}>
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.index}
                index={proposal.index}
                name={proposal.name}
                voteCount={proposal.voteCount}
                isWinner={proposal.name === winner}
                disabled={!mounted || !account || !isCorrectNetwork || !canVote}
                onVote={vote}
              />
            ))}
          </div>
        </section>

        <section className={styles.actionsSection}>
          <div className={styles.sectionTop}>
            <div>
              <h2 className={styles.sectionTitle}>Управление голосованием</h2>
              <p className={styles.sectionText}>
                Используйте формы ниже для выдачи прав, делегирования и голосования.
              </p>
            </div>
          </div>

          <ActionPanel
            isChairperson={mounted && !!isChairperson && isCorrectNetwork}
            hasVotingRight={mounted && hasVotingRight && isCorrectNetwork}
            canVote={mounted && canVote && isCorrectNetwork}
            proposalOptions={proposals.map((proposal) => ({ index: proposal.index, name: proposal.name }))}
            onGrant={giveRightToVote}
            onDelegate={delegateVote}
            onVote={vote}
          />
        </section>
      </div>
    </main>
  );
}
