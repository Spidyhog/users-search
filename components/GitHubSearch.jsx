import { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Table,
  Loader,
  Message,
  Image,
  Header,
  Segment,
  Button,
} from "semantic-ui-react";

import styles from "../styles/GitHubSearch.module.css";

const GitHubSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [isClient, setIsClient] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        const apiEndpoint = query.trim()
          ? `https://api.github.com/search/users?q=${query}&sort=followers`
          : "https://api.github.com/users?per_page=1000&sort=followers";

        const response = await axios.get(apiEndpoint);
        const users = response.data.items || response.data;
        setResults(users);
        setTotalPages(Math.ceil(users.length / usersPerPage));
      } catch (error) {
        setError(
          "Error fetching data from GitHub API. Please try again later."
        );
        console.error("Error fetching data from GitHub API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, usersPerPage]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = results.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <Segment basic className={styles.container}>
      <Header as="h1" textAlign="center" className={styles.title}>
        GitHub Users - Sorted by Followers
      </Header>

      <Input
        fluid
        icon="search"
        placeholder="Search GitHub users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
      />

      {loading && <Loader active>Loading...</Loader>}

      {error && <Message negative>{error}</Message>}

      <Table celled striped className={styles.userTable}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Avatar</Table.HeaderCell>
            <Table.HeaderCell>User</Table.HeaderCell>
            <Table.HeaderCell>Profile URL</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {currentUsers.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <Image src={user.avatar_url} size="mini" circular />
              </Table.Cell>
              <Table.Cell>{user.login}</Table.Cell>
              <Table.Cell>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.html_url}
                </a>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {isClient && (
        <div className={styles.paginationContainer}>
          {/* Pagination */}
          <Button
            icon="chevron left"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${styles.paginationBtn} ${styles.prevBtn}`}
          />
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`${styles.paginationBtn} ${
                currentPage === index + 1 ? styles.active : ""
              }`}
            >
              {index + 1}
            </Button>
          ))}
          <Button
            icon="chevron right"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${styles.paginationBtn} ${styles.nextBtn}`}
          />
        </div>
      )}
    </Segment>
  );
};

export default GitHubSearch;
