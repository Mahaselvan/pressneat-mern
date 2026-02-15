import { Box, Button, Flex, Heading, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statuses = ["Pending", "Assigned", "Picked Up", "Ironing", "Out for Delivery", "Delivered"];

const statusColors = {
  Pending: "#fef3c7",
  Assigned: "#dbeafe",
  "Picked Up": "#ede9fe",
  Ironing: "#ffedd5",
  "Out for Delivery": "#fef9c3",
  Delivered: "#dcfce7",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, adminLogout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All Orders");
  const [message, setMessage] = useState("Loading...");

  const load = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        axios.get("/admin/analytics"),
        axios.get("/admin/orders"),
      ]);
      setAnalytics(analyticsRes.data);
      setOrders(ordersRes.data);
      setMessage("");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to load admin dashboard");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "All Orders") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(`/admin/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((order) => (order._id === orderId ? data : order)));
    } catch (error) {
      setMessage("Failed to update order status");
    }
  };

  return (
    <Box minH="100vh" bg="#f5f7fb">
      <Flex
        px={{ base: 4, md: 10 }}
        py={5}
        align="center"
        justify="space-between"
        borderBottom="1px solid #e5e7eb"
        bg="white"
      >
        <HStack spacing={3}>
          <Box
            bg="#1e3a8a"
            color="white"
            w={9}
            h={9}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="700"
          >
            P
          </Box>
          <Heading size="md" color="#0f172a">
            PressNeat Admin
          </Heading>
        </HStack>

        <HStack>
          <Button variant="outline" onClick={() => navigate("/")}>
            View Website
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              adminLogout();
              navigate("/admin/login");
            }}
          >
            Logout
          </Button>
        </HStack>
      </Flex>

      <Box px={{ base: 4, md: 10 }} py={8}>
        <Heading mb={2}>Dashboard</Heading>
        <Text color="gray.600" mb={8}>
          Monitor and manage all ironing orders {admin?.name ? `for ${admin.name}` : ""}
        </Text>

        {!analytics ? (
          <Text>{message}</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <MetricCard label="Total Revenue" value={`₹${analytics.totalRevenue}`} />
            <MetricCard label="Total Orders" value={analytics.totalOrders} />
            <MetricCard label="Today's Orders" value={analytics.todaysOrders} />
            <MetricCard label="Active Orders" value={analytics.activeOrders} />
          </SimpleGrid>
        )}

        <Box bg="white" border="1px solid #e5e7eb" borderRadius="2xl" p={6}>
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} mb={4} wrap="wrap">
            <Heading size="md">Recent Orders</Heading>
            <HStack>
              <select
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All Orders</option>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <Button variant="outline" onClick={load}>
                Refresh
              </Button>
            </HStack>
          </Flex>

          <Box overflowX="auto">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
              <thead>
                <tr>
                  {["Order ID", "Customer", "Items", "Amount", "Status", "Actions"].map((head) => (
                    <th
                      key={head}
                      style={{
                        textAlign: "left",
                        padding: "12px 10px",
                        borderBottom: "1px solid #e5e7eb",
                        color: "#334155",
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={cellStyle}>#{order._id.slice(-6).toUpperCase()}</td>
                    <td style={cellStyle}>{order.customerName}</td>
                    <td style={cellStyle}>{order.pieceCount} pieces</td>
                    <td style={cellStyle}>₹{order.totalPrice}</td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: statusColors[order.status] || "#f1f5f9",
                          fontWeight: 600,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <select
                        style={{
                          padding: "8px 10px",
                          borderRadius: "10px",
                          border: "1px solid #d1d5db",
                          background: "white",
                        }}
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const cellStyle = {
  padding: "12px 10px",
  borderBottom: "1px solid #f1f5f9",
};

const MetricCard = ({ label, value }) => (
  <Box p={6} bg="white" borderRadius="xl" border="1px solid #e5e7eb">
    <Text color="gray.600" mb={1}>
      {label}
    </Text>
    <Text fontSize="4xl" fontWeight="700" color="#0f172a">
      {value}
    </Text>
  </Box>
);

export default AdminDashboard;
