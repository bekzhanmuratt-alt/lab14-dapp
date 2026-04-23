import styles from "./StatusBanner.module.css";

type Props = {
  type: "idle" | "pending" | "success" | "error";
  message: string;
};

export function StatusBanner({ type, message }: Props) {
  const toneClass =
    type === "success"
      ? styles.success
      : type === "error"
      ? styles.error
      : type === "pending"
      ? styles.idle
      : styles.idle;

  return (
    <div className={`${styles.banner} ${toneClass}`}>
      <p className={styles.message}>{message || "Ожидание действий пользователя"}</p>
    </div>
  );
}