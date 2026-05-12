import React from 'react';
import { Container, Box, Card, CardContent, Typography, Grid } from '@mui/material';

const App: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1">
          Notes App
        </Typography>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, padding: '40px 0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {['Col 1', 'Col 2', 'Col 3'].map((title, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This is a simple card component in {title.toLowerCase()}.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          marginTop: 'auto',
        }}
      >
        <Typography variant="body2">
          © 2026 Notes App. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default App;

