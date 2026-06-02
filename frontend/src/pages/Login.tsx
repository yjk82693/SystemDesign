import { Form, Button, Input, Divider } from "antd";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Login({
  onLogin,
}: {
  onLogin: (token: string) => void;
}) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    setErrorMsg(null);

    const res = await fetch("http://localhost:5001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      onLogin(data.token);
    } else {
      setErrorMsg(data.message || "User ID or password is incorrect.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      {/* ── Left: Logo / Banner ── */}
      <div
        style={{
          flex: 1,
          position: "relative",
          background: "#000",
          overflow: "hidden",
        }}
      >
        <img
          src="/images/logo.png"
          alt="Company Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      {/* ── Right: Form ── */}
      <div
        style={{
          width: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          background: "#fff",
        }}
      >
        <div style={{ width: "100%" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, color: "#1a1a1a" }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 32 }}>
            Sign in to your account
          </p>

          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              label="User ID"
              name="publicId"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. yxk5283" size="large" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true }]}
            >
              <Input.Password size="large" />
            </Form.Item>

            {/* ── Error message ── */}
            {errorMsg && (
              <div
                style={{
                  color: "#ff4d4f",
                  fontSize: 13,
                  marginBottom: 12,
                  padding: "8px 12px",
                  background: "#fff2f0",
                  border: "1px solid #ffccc7",
                  borderRadius: 6,
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 8 }}>
              Login
            </Button>

            {/* ── Can't login ── */}
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <Link to="/forgot-password">
                <Button type="link" size="small" style={{ color: "#888", fontSize: 13 }}>
                  Can't login?
                </Button>
              </Link>
            </div>

            <Divider plain style={{ color: "#ccc", fontSize: 13 }}>or</Divider>

            <Link to="/register">
              <Button block size="large">
                New User
              </Button>
            </Link>
          </Form>
        </div>
      </div>
    </div>
  );
}