import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    language: "English",
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    waterSaved: "0L",
    energySaved: "0.0 kWh",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const initials = useMemo(() => {
    if (!form.name) return "PN";
    return form.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [form.name]);

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, ordersRes] = await Promise.all([refreshUser(), axios.get("/orders/my")]);
        setForm({
          name: profile.name || "",
          phone: profile.phone || "",
          email: profile.email || "",
          address: profile.address || "",
          pincode: profile.pincode || "",
          language: profile.language || "English",
        });

        const orders = ordersRes.data || [];
        const paidOrders = orders.filter((order) => order.paymentStatus === "Paid");
        const totalSpent = paidOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const totalItems = orders.reduce((sum, order) => sum + (order.pieceCount || 0), 0);
        const waterSavedLitres = totalItems * 2;
        const energySavedKwh = (totalItems * 0.08).toFixed(1);

        setStats({
          totalOrders: orders.length,
          totalSpent,
          waterSaved: `${waterSavedLitres}L`,
          energySaved: `${energySavedKwh} kWh`,
        });
      } catch (error) {
        setMessage(error?.response?.data?.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshUser]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      await updateProfile({
        name: form.name,
        email: form.email,
        address: form.address,
        pincode: form.pincode,
        language: form.language,
      });
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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
                    {form.name || "PressNeat User"}
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    📍 {form.pincode ? `${form.address} - ${form.pincode}` : "Set your address and pincode"}
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
                    {user.subscription || "Free"}
                  </Box>
                </Box>
              </HStack>
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
              <StatCard icon="📦" value={String(stats.totalOrders)} label="Total Orders" valueColor="#18181b" />
              <StatCard icon="₹" value={String(stats.totalSpent)} label="Total Spent" valueColor="#18181b" />
              <StatCard icon="♻" value={stats.waterSaved} label="Water Saved" valueColor="#16a34a" />
            </Grid>

            <Box bg="white" border="1px solid #d4d4d8" borderRadius="xl" p={4}>
              <Text fontWeight="700" mb={3}>
                Profile Details
              </Text>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                <Input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input value={form.phone} isReadOnly placeholder="Phone" />
                <Input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <Select
                  value={form.language}
                  onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
                >
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Hindi">Hindi</option>
                </Select>
                <Input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                />
                <Input
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))}
                />
              </Grid>
              <HStack mt={4}>
                <Button colorScheme="orange" onClick={handleSave} isLoading={saving} isDisabled={loading}>
                  Save Profile
                </Button>
                <Button variant="outline" onClick={() => navigate("/track")}>
                  Track Orders
                </Button>
              </HStack>
            </Box>

            <Box bg="#effcf3" border="1px solid #a7f3d0" borderRadius="xl" p={5}>
              <Text color="#15803d" fontWeight="700" mb={3}>
                Your Eco Impact
              </Text>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <Box textAlign="center">
                  <Text fontSize="3xl" fontWeight="800" color="#16a34a">
                    {stats.waterSaved}
                  </Text>
                  <Text color="gray.600">Water Saved</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="3xl" fontWeight="800" color="#f97316">
                    {stats.energySaved}
                  </Text>
                  <Text color="gray.600">Energy Saved</Text>
                </Box>
              </Grid>
            </Box>

            <Button
              justifyContent="space-between"
              variant="outline"
              borderColor="#d4d4d8"
              bg="white"
              color="#ef4444"
              fontWeight="700"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sign Out
            </Button>

            {message ? (
              <Text fontSize="sm" color="gray.700">
                {message}
              </Text>
            ) : null}
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

export default Profile;
