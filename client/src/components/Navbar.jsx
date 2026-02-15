import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/book", label: "Book" },
  { to: "/track", label: "Track" },
  { to: "/scanner", label: "Scanner" },
  { to: "/admin-dashboard", label: "Analytics" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Flex
      px={{ base: 4, md: 8 }}
      py={4}
      align="center"
      justify="space-between"
      borderBottom="1px solid"
      borderColor="orange.100"
      bg="whiteAlpha.900"
      position="sticky"
      top={0}
      zIndex={10}
      backdropFilter="blur(8px)"
    >
      <Text fontWeight="800" color="orange.500" letterSpacing="0.5px">
        PressNeat
      </Text>

      <HStack gap={2} display={{ base: "none", md: "flex" }}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {({ isActive }) => (
              <Box
                px={3}
                py={1.5}
                borderRadius="md"
                bg={isActive ? "orange.500" : "transparent"}
                color={isActive ? "white" : "gray.700"}
                fontWeight={isActive ? "600" : "500"}
                _hover={{ bg: isActive ? "orange.500" : "orange.50" }}
              >
                {item.label}
              </Box>
            )}
          </NavLink>
        ))}
      </HStack>

      {user ? (
        <HStack>
          <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
            {user.name || "Profile"}
          </Button>
          <Button
            colorScheme="orange"
            size="sm"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </HStack>
      ) : (
        <Button colorScheme="orange" size="sm" onClick={() => navigate("/login")}>
          Login
        </Button>
      )}
    </Flex>
  );
};

export default Navbar;
