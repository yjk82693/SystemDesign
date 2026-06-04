import { Form, Input, Button, Card, Select, DatePicker } from "antd";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const res = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        message.success(`Registered! Your ID: ${data.publicId}`);
        setTimeout(() => navigate("/"), 1500);
      } else {
        message.error(data.message || "Registration failed.");
      }
    } catch {
      message.error("Server error. Please try again.");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "#f0f2f5",
    }}>
      <Card
        title="Register"
        style={{ width: 420, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number">
              <Input placeholder="e.g. +82 10-1234-5678" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }, { min: 8, message: "Password must be at least 8 characters" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="jobRole" label="Job Role" rules={[{ required: true }]}>
            <Select options={[
              { value: "Developer", label: "Developer" },
              { value: "Artist", label: "Artist" },
              { value: "Designer", label: "Designer" },
            ]} />
          </Form.Item>

          <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large">
            Register
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
      </Card>
    </div>
  );
}