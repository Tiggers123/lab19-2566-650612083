"use client";
import { Footer } from "@/components/Footer";
import {
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  //All courses state
  const [courses, setCourses] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  //login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [authenUsername, setAuthenUsername] = useState(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  //my courses state
  const [myCourses, setMyCourses] = useState(null);
  const [loadingMyCourses, setLoadingMyCourses] = useState(false);

  const loadCourses = async () => {
    setLoadingCourses(true);
    const resp = await axios.get("/api/course");
    setCourses(resp.data.courses);
    setLoadingCourses(false);
  };

  const loadMyCourses = async () => {
    setLoadingMyCourses(true); // เริ่มต้นโหลดข้อมูล
    try {
      const resp = await axios.get("/api/enrollment", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyCourses(resp.data.courses);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoadingMyCourses(false); // เมื่อโหลดเสร็จหรือเกิดข้อผิดพลาด ให้หยุดโหลด
    }
  };

  useEffect(() => {
    loadCourses();

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
      setToken(token);
      setAuthenUsername(username);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    loadMyCourses();
  }, [token]);

  const login = async () => {
    try {
      setLoadingLogin(true); // เริ่มต้นกระบวนการ Login
      const resp = await axios.post("/api/user/login", { username, password });
      setToken(resp.data.token);
      setAuthenUsername(resp.data.username);
      setUsername("");
      setPassword("");
      localStorage.setItem("token", resp.data.token);
      localStorage.setItem("username", resp.data.username);
    } catch (error) {
      if (error.response.data) {
        alert(error.response.data.message);
      }
    } finally {
      setLoadingLogin(false); // เมื่อคำขอ API เสร็จสมบูรณ์ หรือเกิดข้อผิดพลาด ให้หยุดกระบวนการ Login
    }
  };

  const logout = () => {
    setAuthenUsername(null);
    setToken(null);
    setMyCourses(null);

    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <Container size="sm">
      <Title italic align="center" color="violet" my="xs">
        Course Enrollment
      </Title>
      <Stack>
        {/* all courses section */}
        <Paper withBorder p="md">
          <Title order={4}>All courses</Title>
          {loadingCourses && !courses && <Loader variant="dots" />}
          {courses &&
            courses.map((course) => (
              <Text key={course.courseNo}>
                {course.courseNo} - {course.title}
              </Text>
            ))}
        </Paper>

        {/* log in section */}
        <Paper withBorder p="md">
          <Title order={4}>Login</Title>
          {!authenUsername && (
            <Group align="flex-end">
              <TextInput
                label="Username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
              <TextInput
                label="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <Button onClick={login} disabled={loadingLogin}>
                {loadingLogin ? "Login..." : "Login"}{" "}
                {/* แสดง "Login" หรือ "Login..." ตามสถานะ loading */}
              </Button>
            </Group>
          )}
          {authenUsername && (
            <Group>
              <Text fw="bold">Hi {authenUsername}!</Text>
              <Button color="red" onClick={logout}>
                Logout
              </Button>
            </Group>
          )}
        </Paper>

        {/* enrollment section */}
        <Paper withBorder p="md">
          <Title order={4}>My courses</Title>
          {!authenUsername && (
            <Text color="dimmed">Please login to see your course(s)</Text>
          )}
          {loadingMyCourses && <Loader variant="dots" />}{" "}
          {/* แสดง Loader ถ้ากำลังโหลด */}
          {authenUsername && myCourses && myCourses.length > 0
            ? myCourses.map((course) => (
                <Text key={course.courseNo}>
                  {course.courseNo} - {course.title}
                </Text>
              ))
            : null}
        </Paper>
        <Footer year="2023" fullName="Tiger Tanner" studentId="650612083" />
      </Stack>
    </Container>
  );
}
