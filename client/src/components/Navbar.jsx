import { Flex, Box, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <Flex bg="orange.400" p={4} justify="space-between" color="white">
      <Box fontWeight="bold">IronSwift</Box>
      <Flex gap={4}>
        <Link to="/">Home</Link>
        <Link to="/book">Book</Link>
        <Link to="/track">Track</Link>
        <Link to="/profile">Profile</Link>
      </Flex>
    </Flex>
  );
};

export default Navbar;
