import { Box, Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phone || !password || (isRegisterMode && !name)) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      if (isRegisterMode) {
        await register({ name, phone, password });
        setMessage("Registration successful. Please login.");
        setIsRegisterMode(false);
      } else {
        await login({ phone, password });
        navigate("/");
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box px={5} py={10}>
        <Box
          maxW="430px"
          mx="auto"
          bg="white"
          border="1px solid"
          borderColor="orange.100"
          borderRadius="2xl"
          boxShadow="0 12px 28px rgba(251, 146, 60, 0.2)"
          p={7}
        >
          <Heading size="lg" mb={5} color="orange.500">
            {isRegisterMode ? "Create Account" : "Welcome Back"}
          </Heading>
          <VStack spacing={4}>
            {isRegisterMode ? (
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            ) : null}
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button colorScheme="orange" w="100%" onClick={handleSubmit} isLoading={loading}>
              {isRegisterMode ? "Register" : "Login"}
            </Button>
            <Button
              variant="ghost"
              w="100%"
              onClick={() => {
                setIsRegisterMode((prev) => !prev);
                setMessage("");
              }}
            >
              {isRegisterMode ? "Already have an account? Login" : "New user? Register"}
            </Button>
            {message ? (
              <Text fontSize="sm" color="gray.600">
                {message}
              </Text>
            ) : null}
          </VStack>
        </Box>
      </Box>
    </>
  );
};

export default Login;
