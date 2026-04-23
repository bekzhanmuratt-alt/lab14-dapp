import styles from "./ProposalCard.module.css";

type ProposalCardProps = {
  index: number;
  name: string;
  voteCount: number;
  isWinner: boolean;
  disabled: boolean;
  onVote: (proposalIndex: number) => Promise<void> | void;
};

export function ProposalCard({
  index,
  name,
  voteCount,
  isWinner,
  disabled,
  onVote,
}: ProposalCardProps) {
  return (
    <article className={`${styles.card} ${isWinner ? styles.winner : ""}`}>
      <div className={styles.topRow}>
        <span className={styles.pill}>Кандидат #{index + 1}</span>
        {isWinner ? <span className={styles.pillAccent}>Лидер</span> : null}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.votes}>Количество голосов: <strong>{voteCount}</strong></p>
      </div>

      <button
        type="button"
        className={styles.button}
        onClick={() => onVote(index)}
        disabled={disabled}
      >
        Голосовать
      </button>
    </article>
  );
}
