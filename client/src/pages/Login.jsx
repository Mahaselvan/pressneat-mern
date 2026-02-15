import { Box, Input, Button, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await login({ phone, password });
    navigate("/");
  };

  return (
    <Box maxW="400px" mx="auto" mt="100px">
      <Heading mb={6}>Login</Heading>

      <Input
        placeholder="Phone"
        mb={4}
        onChange={(e) => setPhone(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        mb={6}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button colorScheme="orange" w="100%" onClick={handleLogin}>
        Login
      </Button>
    </Box>
  );
};

export default Login;
