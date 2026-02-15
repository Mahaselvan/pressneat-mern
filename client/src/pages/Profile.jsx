import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isPremium, setIsPremium] = useState((user?.subscription || "").toLowerCase() === "premium");

  const initials = !user?.name
    ? "PN"
    : user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

  if (!user) {
    return (
      <>
        <Navbar />
        <Container maxW="760px" px={{ base: 4, md: 6 }} py={8}>
          <Box bg="white" border="1px solid #e5e7eb" borderRadius="2xl" p={7}>
            <Heading size="md" mb={3}>
              Profile
            </Heading>
            <Text mb={5} color="gray.600">
              Please login to view your account details.
            </Text>
            <Button colorScheme="orange" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box bg="#f4f4f5" minH="100vh">
        <Container maxW="760px" px={{ base: 4, md: 6 }} py={7}>
          <VStack align="stretch" spacing={4}>
            <Box borderTop="1px solid #d4d4d8" pt={4}>
              <HStack align="start" spacing={4}>
                <Flex
                  w="56px"
                  h="56px"
                  borderRadius="full"
                  bg="orange.500"
                  color="white"
                  align="center"
                  justify="center"
                  fontWeight="700"
                >
                  {initials}
                </Flex>
                <Box>
                  <Heading size="md" color="#18181b">
                    {user.name || "PressNeat User"}
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    <span role="img" aria-label="location">
                      📍
                    </span>{" "}
                    {user.address || "Sriperumbudur, 602105"}
                  </Text>
                  <Box
                    display="inline-flex"
                    mt={2}
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="orange.500"
                    color="white"
                    fontSize="xs"
                    fontWeight="700"
                  >
                    Premium
                  </Box>
                </Box>
              </HStack>
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
              <StatCard
                icon="📦"
                value={String(user.totalOrders ?? 3)}
                label="Total Orders"
                valueColor="#18181b"
              />
              <StatCard
                icon="₹"
                value={String(user.totalSpent ?? 240)}
                label="Total Spent"
                valueColor="#18181b"
              />
              <StatCard
                icon="♻"
                value={String(user.waterSaved ?? "35L")}
                label="Water Saved"
                valueColor="#16a34a"
              />
            </Grid>

            <ActionCard>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text fontWeight="700" color="#18181b">
                    Premium Subscription
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Get 20% off on all orders
                  </Text>
                </Box>
                <Button
                  onClick={() => setIsPremium((prev) => !prev)}
                  size="sm"
                  borderRadius="full"
                  bg={isPremium ? "orange.500" : "gray.300"}
                  color="white"
                  minW="58px"
                  _hover={{ bg: isPremium ? "orange.600" : "gray.400" }}
                >
                  {isPremium ? "ON" : "OFF"}
                </Button>
              </Flex>
            </ActionCard>

            <ActionCard>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text fontWeight="700" color="#18181b">
                    Language
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    English
                  </Text>
                </Box>
                <Button variant="outline" size="sm">
                  தமிழ்
                </Button>
              </Flex>
            </ActionCard>

            <Text fontWeight="700" color="#18181b">
              Contact Info
            </Text>
            <Box bg="white" border="1px solid #d4d4d8" borderRadius="xl" p={4}>
              <VStack align="stretch" spacing={3}>
                <Text color="#18181b">📞 {user.phone || "+91 98765 43210"}</Text>
                <Box h="1px" bg="#e4e4e7" />
                <Text color="#18181b">✉ {user.email || "priya@example.com"}</Text>
                <Box h="1px" bg="#e4e4e7" />
                <Text color="#18181b">📍 {user.address || "42, Gandhi Nagar, Sriperumbudur"}</Text>
              </VStack>
            </Box>

            <Box bg="#effcf3" border="1px solid #a7f3d0" borderRadius="xl" p={5}>
              <Text color="#15803d" fontWeight="700" mb={3}>
                Your Eco Impact
              </Text>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <Box textAlign="center">
                  <Text fontSize="3xl" fontWeight="800" color="#16a34a">
                    35L
                  </Text>
                  <Text color="gray.600">Water Saved</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="3xl" fontWeight="800" color="#f97316">
                    1.4 kWh
                  </Text>
                  <Text color="gray.600">Energy Saved</Text>
                </Box>
              </Grid>
            </Box>

            <ActionRow
              label={user.role === "admin" ? "Admin Panel" : "Track Orders"}
              onClick={() => navigate(user.role === "admin" ? "/admin" : "/track")}
            />
            <ActionRow label="Settings" onClick={() => navigate("/profile")} />
            <ActionRow
              label="Sign Out"
              color="#ef4444"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            />
          </VStack>
        </Container>
      </Box>
    </>
  );
};

const StatCard = ({ icon, value, label, valueColor }) => (
  <Box bg="white" border="1px solid #d4d4d8" borderRadius="xl" p={4} textAlign="center">
    <Text mb={1}>{icon}</Text>
    <Text fontSize="3xl" fontWeight="800" color={valueColor}>
      {value}
    </Text>
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
  </Box>
);

const ActionCard = ({ children }) => (
  <Box bg="white" border="1px solid #d4d4d8" borderRadius="xl" p={4}>
    {children}
  </Box>
);

const ActionRow = ({ label, onClick, color = "#18181b" }) => (
  <Button
    justifyContent="space-between"
    rightIcon={<Text color="gray.400">›</Text>}
    variant="outline"
    borderColor="#d4d4d8"
    bg="white"
    color={color}
    fontWeight={label === "Sign Out" ? "700" : "500"}
    onClick={onClick}
  >
    {label}
  </Button>
);

export default Profile;
