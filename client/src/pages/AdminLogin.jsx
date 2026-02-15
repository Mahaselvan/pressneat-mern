import { Box, Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, adminRegister } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      password,
      adminSecret: adminSecret.trim(),
    };

    if (!payload.phone || !payload.password || (mode === "register" && !payload.name)) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (mode === "register") {
        await adminRegister(payload);
      } else {
        await adminLogin({ phone: payload.phone, password: payload.password });
      }

      navigate("/admin");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Admin authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box px={5} py={10}>
      <Box
        maxW="430px"
        mx="auto"
        bg="white"
        border="1px solid"
        borderColor="blue.100"
        borderRadius="2xl"
        boxShadow="0 12px 28px rgba(37, 99, 235, 0.12)"
        p={7}
      >
        <Heading size="lg" mb={5} color="blue.700">
          {mode === "register" ? "Admin Registration" : "Admin Login"}
        </Heading>
        <VStack spacing={4}>
          {mode === "register" ? (
            <Input placeholder="Admin Name" value={name} onChange={(e) => setName(e.target.value)} />
          ) : null}
          <Input placeholder="Admin Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "register" ? (
            <Input
              placeholder="Admin Secret (if required)"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
            />
          ) : null}
          <Button colorScheme="blue" w="100%" onClick={handleSubmit} isLoading={loading}>
            {mode === "register" ? "Register Admin" : "Login to Admin"}
          </Button>
          <Button
            variant="ghost"
            w="100%"
            onClick={() => {
              setMode((prev) => (prev === "login" ? "register" : "login"));
              setMessage("");
            }}
          >
            {mode === "register" ? "Already admin? Login" : "Need admin account? Register"}
          </Button>
          {message ? <Text fontSize="sm">{message}</Text> : null}
        </VStack>
      </Box>
    </Box>
  );
};

export default AdminLogin;
