import { Form, Button, Input, Steps } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send verification code
  const onSendCode = async (values: any) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: values.publicId, email: values.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserId(values.publicId);
        setEmail(values.email);
        setStep(1);
      } else {
        setErrorMsg(data.message || "User ID or email does not match.");
      }
    } catch {
      setErrorMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const onVerifyCode = async (values: any) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: userId, code: values.code }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/reset-password", { state: { token: data.resetToken } });
      } else {
        setErrorMsg(data.message || "Invalid or expired verification code.");
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
        {/* ── Header ── */}
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4, color: "#1a1a1a" }}>
          Reset your password
        </h2>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 32 }}>
          {step === 0
            ? "Enter your User ID and email to receive a verification code."
            : `A verification code was sent to ${email}`}
        </p>

        {/* ── Steps indicator ── */}
        <Steps
          current={step}
          size="small"
          style={{ marginBottom: 32 }}
          items={[
            { title: "Verify identity" },
            { title: "Enter code" },
          ]}
        />

        {/* ── Error message ── */}
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

        {/* ── Step 0: User ID + Email ── */}
        {step === 0 && (
          <Form onFinish={onSendCode} layout="vertical">
            <Form.Item
              label="User ID"
              name="publicId"
              rules={[{ required: true, message: "Please enter your User ID" }]}
            >
              <Input placeholder="e.g. yxk5283" size="large" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="e.g. you@company.com" size="large" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ marginTop: 8 }}
            >
              Send Verification Code
            </Button>

            <Button
              type="link"
              block
              style={{ marginTop: 8, color: "#888" }}
              onClick={() => navigate("/")}
            >
              Back to Login
            </Button>
          </Form>
        )}

        {/* ── Step 1: Verification code ── */}
        {step === 1 && (
          <Form onFinish={onVerifyCode} layout="vertical">
            <Form.Item
              label="Verification Code"
              name="code"
              rules={[{ required: true, message: "Please enter the verification code" }]}
            >
              <Input
                placeholder="Enter 6-digit code"
                size="large"
                maxLength={6}
                style={{ letterSpacing: 4, fontSize: 18, textAlign: "center" }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ marginTop: 8 }}
            >
              Verify & Continue
            </Button>

            <Button
              type="link"
              block
              style={{ marginTop: 8, color: "#888" }}
              onClick={() => { setStep(0); setErrorMsg(null); }}
            >
              Resend code
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}