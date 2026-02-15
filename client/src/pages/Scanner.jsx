import { Box, Button, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import axios from "../api/axios";

const Scanner = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post("/scanner", formData);
    setResult(res.data);
  };

  return (
    <Box p={6}>
      <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <Button mt={4} colorScheme="orange" onClick={handleUpload}>
        Scan Clothes
      </Button>

      {result && (
        <Box mt={4}>
          <Text>Fabric: {result.fabric}</Text>
          <Text>Count: {result.count}</Text>
          <Text>Estimated Price: ₹{result.price}</Text>
          <Text>Eco Score: {result.eco_score}</Text>
        </Box>
      )}
    </Box>
  );
};

export default Scanner;
