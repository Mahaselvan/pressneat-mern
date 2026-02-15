import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  const checkPincode = async () => {
    try {
      setChecking(true);
      const res = await axios.get(`/service/${pincode}`);
      setMessage(
        res.data.available
          ? `Service available. Delivery charge ₹${res.data.deliveryCharge}.`
          : "Sorry, this pincode is currently not serviceable."
      );
    } catch {
      setMessage("Unable to check pincode right now.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box bg="#f7f8fb">
        <Container maxW="1200px" px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={{ base: 8, md: 12 }}
            alignItems="center"
          >
            <VStack align="start" spacing={5}>
              <Heading size="2xl" lineHeight="1.15" color="#0b1f45">
                Ironing, Picked Up &amp; Delivered to Your Door
              </Heading>
              <Text color="gray.600" maxW="500px">
                Professional ironing service at your fingertips. Schedule a pickup, we iron your
                clothes to perfection, and deliver them back fresh and crisp.
              </Text>

              <HStack spacing={3} flexWrap="wrap">
                <Button
                  bg="#2b4aa2"
                  color="white"
                  _hover={{ bg: "#213d88" }}
                  onClick={() => navigate("/book")}
                >
                  Book Ironing Now
                </Button>
                <Button
                  variant="outline"
                  borderColor="gray.300"
                  onClick={() => {
                    const section = document.getElementById("how-it-works");
                    section?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  How It Works
                </Button>
              </HStack>

              <Box w="full" maxW="430px">
                <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">
                  Check serviceability
                </Text>
                <HStack spacing={2} align="start">
                  <Input
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    bg="white"
                  />
                  <Button colorScheme="orange" onClick={checkPincode} isLoading={checking}>
                    Check
                  </Button>
                </HStack>
                {message ? (
                  <Text mt={2} fontSize="sm" color="gray.700">
                    {message}
                  </Text>
                ) : null}
              </Box>

              <SimpleGrid columns={3} spacing={6} pt={2}>
                <Box>
                  <Text fontWeight="800" fontSize="2xl" color="#0b1f45">
                    10K+
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Happy Customers
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="800" fontSize="2xl" color="#0b1f45">
                    50K+
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Orders Delivered
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="800" fontSize="2xl" color="#0b1f45">
                    4.8*
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Average Rating
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>

            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="0 10px 30px rgba(13, 28, 66, 0.2)"
              bg="white"
            >
              <Image
                src="https://images.unsplash.com/photo-1612858245825-8f8169430f5f?auto=format&fit=crop&w=1200&q=80"
                alt="Pickup delivery partner on bike"
                w="100%"
                h={{ base: "280px", md: "430px" }}
                objectFit="cover"
              />
            </Box>
          </Grid>
        </Container>

        <Box py={{ base: 12, md: 16 }} bg="#f1f3f7">
          <Container maxW="1200px" px={{ base: 4, md: 8 }}>
            <VStack spacing={2} mb={8}>
              <Heading size="lg" color="#0b1f45">
                Why Choose PressGo?
              </Heading>
              <Text color="gray.600" textAlign="center">
                India&apos;s first on-demand ironing service with doorstep pickup and delivery
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
              {[
                {
                  icon: "🚚",
                  title: "Fast Pickup",
                  text: "Same-day pickup from your doorstep. No more waiting!",
                },
                {
                  icon: "₹",
                  title: "Affordable Pricing",
                  text: "Starting at ₹10/piece. Transparent pricing, no hidden charges.",
                },
                {
                  icon: "📅",
                  title: "Weekly Subscription",
                  text: "Subscribe and save up to 30% on regular orders.",
                },
                {
                  icon: "♨",
                  title: "Eco Steam Iron",
                  text: "Premium steam ironing for wrinkle-free perfection.",
                },
              ].map((item) => (
                <Box
                  key={item.title}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  p={5}
                  minH="180px"
                >
                  <Box
                    w="34px"
                    h="34px"
                    borderRadius="md"
                    bg="orange.50"
                    color="orange.500"
                    display="grid"
                    placeItems="center"
                    mb={4}
                  >
                    <Text fontWeight="700">{item.icon}</Text>
                  </Box>
                  <Text fontWeight="700" color="#0b1f45" mb={2}>
                    {item.title}
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    {item.text}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Box py={{ base: 12, md: 16 }} bg="white" id="how-it-works">
          <Container maxW="1000px" px={{ base: 4, md: 8 }}>
            <VStack spacing={2} mb={12}>
              <Heading size="lg" color="#0b1f45">
                How It Works
              </Heading>
              <Text color="gray.600">Get your clothes ironed in 3 simple steps</Text>
            </VStack>

            <Box position="relative">
              <Box
                position="absolute"
                left="0"
                right="0"
                top="14px"
                h="2px"
                bg="gray.200"
                display={{ base: "none", md: "block" }}
              />
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                {[
                  {
                    step: "1",
                    title: "Schedule Pickup",
                    text: "Choose your date, time, and number of clothes",
                  },
                  {
                    step: "2",
                    title: "We Collect & Iron",
                    text: "Our partner picks up and professionally irons your clothes",
                  },
                  {
                    step: "3",
                    title: "Doorstep Delivery",
                    text: "Fresh, crisp clothes delivered back to you",
                  },
                ].map((item) => (
                  <VStack key={item.step} spacing={3} textAlign="center" position="relative">
                    <Flex
                      w="30px"
                      h="30px"
                      borderRadius="full"
                      bg="#2b4aa2"
                      color="white"
                      align="center"
                      justify="center"
                      fontWeight="700"
                      zIndex={1}
                    >
                      {item.step}
                    </Flex>
                    <Text fontWeight="700" color="#0b1f45">
                      {item.title}
                    </Text>
                    <Text color="gray.600" fontSize="sm" maxW="260px">
                      {item.text}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </Box>
          </Container>
        </Box>

        <Box bg="#2b4aa2" py={{ base: 12, md: 16 }}>
          <Container maxW="900px" px={{ base: 4, md: 8 }}>
            <VStack spacing={4} textAlign="center">
              <Heading color="white" size="lg">
                Ready to Get Started?
              </Heading>
              <Text color="blue.100">
                Book your first ironing service today and experience the convenience
              </Text>
              <Button
                bg="orange.400"
                color="white"
                _hover={{ bg: "orange.500" }}
                px={8}
                onClick={() => navigate("/book")}
              >
                Book Ironing Now
              </Button>
            </VStack>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Home;
