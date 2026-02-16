import { Box, Button, Heading, HStack, Input, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const catalog = [
  { key: "shirts", label: "Shirts", price: 15 },
  { key: "pants", label: "Pants", price: 20 },
  { key: "sarees", label: "Sarees", price: 50 },
  { key: "uniforms", label: "Uniforms", price: 15 },
];

const Book = () => {
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [counts, setCounts] = useState({
    shirts: 0,
    pants: 0,
    sarees: 0,
    uniforms: 0,
  });
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [serviceAvailable, setServiceAvailable] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await refreshUser();
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
        const params = new URLSearchParams(location.search);
        const fromQuery = params.get("pincode");
        setPincode(fromQuery || profile.pincode || "");
      } catch {
        // silently keep fields empty
      }
    };
    load();
  }, [location.search, refreshUser]);

  useEffect(() => {
    const check = async () => {
      if (!/^\d{6}$/.test(pincode)) {
        setServiceAvailable(false);
        setDeliveryCharge(0);
        return;
      }
      try {
        const { data } = await axios.get(`/service/${pincode}`);
        setServiceAvailable(Boolean(data.available));
        setDeliveryCharge(data.available ? data.deliveryCharge || 0 : 0);
      } catch {
        setServiceAvailable(false);
        setDeliveryCharge(0);
      }
    };
    check();
  }, [pincode]);

  const { totalItems, itemsTotal, totalAmount, itemsList } = useMemo(() => {
    let totalItemsCalc = 0;
    let itemsAmount = 0;
    const itemNames = [];

    catalog.forEach((item) => {
      const qty = counts[item.key] || 0;
      totalItemsCalc += qty;
      itemsAmount += qty * item.price;
      for (let i = 0; i < qty; i += 1) {
        itemNames.push(item.label.slice(0, -1));
      }
    });

    return {
      totalItems: totalItemsCalc,
      itemsTotal: itemsAmount,
      totalAmount: itemsAmount + deliveryCharge,
      itemsList: itemNames,
    };
  }, [counts, deliveryCharge]);

  const adjustCount = (key, delta) => {
    setCounts((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const createOrder = async () => {
    if (!name || !phone || !address || !pincode || totalItems === 0) {
      setMessage("Please fill details and select at least one cloth item.");
      return null;
    }
    if (!serviceAvailable) {
      setMessage("This pincode is not serviceable yet.");
      return null;
    }

    const res = await axios.post("/orders", {
      customerName: name,
      phone,
      address,
      pincode,
      items: itemsList,
      ecoSteam: false,
    });
    setOrderId(res.data._id);
    return res.data._id;
  };

  const confirmAndPay = async () => {
    try {
      setLoading(true);
      setMessage("");

      const currentOrderId = orderId || (await createOrder());
      if (!currentOrderId) {
        return;
      }

      const { data } = await axios.post("/payment/create-order", {
        amount: totalAmount,
        orderId: currentOrderId,
      });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        order_id: data.id,
        name: "PressNeat",
        description: "Laundry payment",
        handler: async function (response) {
          try {
            await axios.post("/payment/verify", {
              ...response,
              orderId: currentOrderId,
            });
            setMessage("Payment successful. Your order is now confirmed.");
          } catch (verifyError) {
            setMessage(verifyError?.response?.data?.message || "Payment verification failed.");
          }
        },
        prefill: { name, contact: phone },
        theme: { color: "#F59E0B" },
      };

      if (!window.Razorpay) {
        setMessage("Payment gateway not loaded. Refresh and try again.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Payment start failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box px={{ base: 4, md: 6 }} py={8} maxW="1150px" mx="auto">
        <Heading mb={2}>Book Ironing Service</Heading>
        <Text color="gray.600" mb={6}>
          Schedule a pickup and get your clothes ironed professionally
        </Text>
        <Box mb={4} p={4} borderRadius="lg" bg="blue.50" border="1px solid #bfdbfe">
          <Text fontWeight="700" color="blue.800" mb={1}>
            Before booking
          </Text>
          <Text fontSize="sm" color="blue.900">
            1. Enter full address and 6-digit pincode.
          </Text>
          <Text fontSize="sm" color="blue.900">
            2. Select at least one cloth item.
          </Text>
          <Text fontSize="sm" color="blue.900">
            3. Ensure pincode shows service available, then pay to confirm order.
          </Text>
        </Box>

        <Box p={6} bg="white" borderRadius="2xl" border="1px solid #e5e7eb" mb={6}>
          <Heading size="md" mb={4}>
            Pickup Details
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              isReadOnly={Boolean(user?.phone)}
            />
            <Input
              placeholder="Pickup Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
          </SimpleGrid>
          <Text mt={3} color={serviceAvailable ? "green.600" : "red.600"} fontSize="sm">
            {serviceAvailable
              ? `Service available. Delivery charge: ₹${deliveryCharge}`
              : "Enter a valid serviceable pincode to continue."}
          </Text>
        </Box>

        <Box p={6} bg="white" borderRadius="2xl" border="1px solid #e5e7eb" mb={6}>
          <Heading size="md" mb={4}>
            Select Clothes
          </Heading>
          <VStack align="stretch" spacing={3}>
            {catalog.map((item) => (
              <HStack key={item.key} justify="space-between" p={4} borderRadius="xl" border="1px solid #e5e7eb">
                <Box>
                  <Text fontWeight="700">{item.label}</Text>
                  <Text color="gray.600">₹{item.price} per piece</Text>
                </Box>
                <HStack>
                  <Button size="sm" onClick={() => adjustCount(item.key, -1)}>
                    -
                  </Button>
                  <Text minW="24px" textAlign="center" fontWeight="700">
                    {counts[item.key]}
                  </Text>
                  <Button size="sm" onClick={() => adjustCount(item.key, 1)}>
                    +
                  </Button>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Box p={6} bg="#fff7ed" borderRadius="2xl" border="1px solid #fed7aa">
          <Heading size="md" mb={4}>
            Price Summary
          </Heading>
          <Text>Total Items: {totalItems} pieces</Text>
          <Text>Items Total: ₹{itemsTotal}</Text>
          <Text>Delivery Charges: ₹{deliveryCharge}</Text>
          <Text mt={3} fontSize="3xl" fontWeight="800" color="#1e3a8a">
            ₹{totalAmount}
          </Text>

          <Button
            mt={4}
            w="100%"
            colorScheme="orange"
            onClick={confirmAndPay}
            isLoading={loading}
            isDisabled={totalItems === 0 || !serviceAvailable}
          >
            Confirm and Pay
          </Button>
          {message ? <Text mt={3}>{message}</Text> : null}
        </Box>
      </Box>
    </>
  );
};

export default Book;
