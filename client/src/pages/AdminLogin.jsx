import { Box, Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMessage("");
      await adminLogin({ phone, password });
      navigate("/admin");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Admin login failed");
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
          Admin Login
        </Heading>
        <VStack spacing={4}>
          <Input placeholder="Admin Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button colorScheme="blue" w="100%" onClick={handleLogin} isLoading={loading}>
            Login to Admin
          </Button>
          {message ? <Text fontSize="sm">{message}</Text> : null}
        </VStack>
      </Box>
    </Box>
  );
};

export default AdminLogin;
