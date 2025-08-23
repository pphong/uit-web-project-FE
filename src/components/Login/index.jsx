import styles from "./Login.module.css";

const Login = () => {
  console.log(styles);
  return (
    <div>
      <p className={styles.login}>Login</p>
    </div>
  );
};

export default Login;
