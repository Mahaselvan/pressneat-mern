import { Box, Button, Heading, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const Scanner = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please choose an image file first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post("/scanner", formData);
      setResult(res.data);
      setMessage("Scan completed.");
    } catch (error) {
      setMessage(error?.response?.data?.error || "Scanner failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box px={5} py={8}>
        <Box
          maxW="620px"
          mx="auto"
          p={7}
          bg="white"
          borderRadius="2xl"
          border="1px solid"
          borderColor="orange.100"
          boxShadow="sm"
        >
          <Heading size="lg" mb={5} color="orange.500">
            AI Fabric Scanner
          </Heading>
          <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <Button mt={4} colorScheme="orange" onClick={handleUpload} isLoading={loading}>
            Scan Clothes
          </Button>
          {message ? <Text mt={3}>{message}</Text> : null}

          {result ? (
            <Box mt={5} p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.100">
              <Text>Fabric: {result.fabric}</Text>
              <Text>Count: {result.count}</Text>
              <Text>Estimated Price: ₹{result.price}</Text>
              <Text>Eco Score: {result.eco_score}</Text>
              {Array.isArray(result.items) && result.items.length > 0 ? (
                <Box mt={3}>
                  <Text fontWeight="700" mb={1}>
                    Item Breakdown
                  </Text>
                  {result.items.map((item, index) => (
                    <Text key={`${item.type}-${index}`} fontSize="sm">
                      {item.type}: {item.count} x ₹{item.price_per_piece}
                    </Text>
                  ))}
                </Box>
              ) : null}
            </Box>
          ) : null}
        </Box>
      </Box>
    </>
  );
};

export default Scanner;
