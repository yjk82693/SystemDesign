import { Form, Button, Input } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.token;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword: values.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/", { state: { message: "Password reset successful. Please log in." } });
      } else {
        setErrorMsg(data.message || "Failed to reset password.");
      }
    } catch {
      setErrorMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <div
        style={{
          width: 440,
          background: "#fff",
          borderRadius: 12,
          padding: "48px 40px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4, color: "#1a1a1a" }}>
          Set new password
        </h2>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 32 }}>
          Your new password must be at least 8 characters.
        </p>

        {errorMsg && (
          <div
            style={{
              color: "#ff4d4f",
              fontSize: 13,
              marginBottom: 16,
              padding: "8px 12px",
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: 6,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter a new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            style={{ marginTop: 8 }}
          >
            Reset Password
          </Button>
        </Form>
      </div>
    </div>
  );
}