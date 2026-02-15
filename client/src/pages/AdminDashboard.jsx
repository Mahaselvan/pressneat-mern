import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, adminLogout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [message, setMessage] = useState("Loading admin dashboard...");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/admin/analytics");
      setAnalytics(data);
      setMessage("");
    } catch {
      setMessage("Unable to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const initials = useMemo(() => {
    if (!admin?.name) return "AD";
    return admin.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [admin?.name]);

  return (
    <Box bg="#f4f4f5" minH="100vh">
      <Container maxW="760px" px={{ base: 4, md: 6 }} py={7}>
        <VStack align="stretch" spacing={4}>
          <Box borderTop="1px solid #d4d4d8" pt={4}>
            <HStack align="start" spacing={4}>
              <Flex
                w="56px"
                h="56px"
                borderRadius="full"
                bg="#1d4ed8"
                color="white"
                align="center"
                justify="center"
                fontWeight="700"
              >
                {initials}
              </Flex>
              <Box>
                <Heading size="md" color="#18181b">
                  {admin?.name || "Admin User"}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  <span role="img" aria-label="location">
                    📍
                  </span>{" "}
                  PressNeat Control Center
                </Text>
                <Box
                  display="inline-flex"
                  mt={2}
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg="#1d4ed8"
                  color="white"
                  fontSize="xs"
                  fontWeight="700"
                >
                  Administrator
                </Box>
              </Box>
            </HStack>
          </Box>

          {loading ? (
            <Box bg="white" border="1px solid #d4d4d8" borderRadius="xl" p={5}>
              <HStack spacing={3}>
                <Spinner color="blue.500" />
                <Text color="gray.600">{message}</Text>
              </HStack>
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
              <StatCard icon="📦" value={analytics?.totalOrders ?? 0} label="Total Orders" />
              <StatCard icon="₹" value={analytics?.totalRevenue ?? 0} label="Total Revenue" />
              <StatCard icon="⚡" value={analytics?.activeOrders ?? 0} label="Active Orders" />
            </Grid>
          )}

          <Box bg="white" border="1px solid #d4d4d8" borderRadius="xl" p={4}>
            <Flex justify="space-between" align="center" gap={3} wrap="wrap">
              <Box>
                <Text fontWeight="700" color="#18181b">
                  Platform Snapshot
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Today&apos;s orders: {analytics?.todaysOrders ?? 0}
                </Text>
              </Box>
              <Button size="sm" colorScheme="blue" onClick={load} isLoading={loading}>
                Refresh
              </Button>
            </Flex>
          </Box>

          <Box bg="#eff6ff" border="1px solid #bfdbfe" borderRadius="xl" p={5}>
            <Text color="#1d4ed8" fontWeight="700" mb={3}>
              Admin Actions
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <Box textAlign="center">
                <Text fontSize="3xl" fontWeight="800" color="#1d4ed8">
                  {analytics?.activeOrders ?? 0}
                </Text>
                <Text color="gray.600">Orders In Progress</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="3xl" fontWeight="800" color="#f97316">
                  {analytics?.todaysOrders ?? 0}
                </Text>
                <Text color="gray.600">Orders Today</Text>
              </Box>
            </Grid>
          </Box>

          <ActionRow label="Manage Orders" onClick={() => navigate("/admin/orders")} />
          <ActionRow label="Go to Home Site" onClick={() => navigate("/")} />
          <ActionRow
            label="Sign Out"
            color="#ef4444"
            onClick={() => {
              adminLogout();
              navigate("/admin/login");
            }}
          />
        </VStack>
      </Container>
    </Box>
  );
};

const StatCard = ({ icon, value, label }) => (
  <Box bg="white" border="1px solid #d4d4d8" borderRadius="xl" p={4} textAlign="center">
    <Text mb={1}>{icon}</Text>
    <Text fontSize="3xl" fontWeight="800" color="#18181b">
      {value}
    </Text>
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
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

export default AdminDashboard;
