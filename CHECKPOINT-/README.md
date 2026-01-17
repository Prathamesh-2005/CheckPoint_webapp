CHECKPOINT 🚗

🚀 Overview

CHECKPOINT is an innovative ride-sharing application that addresses common user challenges in traditional ride-sharing platforms. By intelligently matching two users for a shared ride and splitting the fare proportionally based on distance traveled, CHECKPOINT enhances affordability, efficiency, and user satisfaction. This solution reduces wait times, optimizes routes, and promotes eco-friendly transportation! 🌍

✨ Features

🤝 User Matching: Pairs users with overlapping routes for shared rides.
💰 Fare Splitting: Automatically calculates and splits costs based on individual distances.
🗺️ Real-Time Mapping: Integrates Google Maps API for accurate route planning and navigation.
🔄 Live Updates: Uses WebSockets for real-time tracking and notifications.
🔒 Secure Authentication: Implements OAuth2 and JWT for safe user logins and data protection.
📊 Database Management: Leverages Flyway for seamless schema migrations and Redis for caching.

🛠️ Tech Stack
Backend: Java Spring Boot ☕
Database & Caching: Redis 🗄️ (for caching and real-time data), Flyway DB 📂
Mapping: Google Maps API 🗺️
Real-Time Communication: WebSocket 🔄
Security: OAuth2 🔑, JWT 🔒
Containerization: Docker 🐳
Other: Additional libraries as required (e.g., for algorithms, testing, or integrations)

🧠 Key Algorithms to Implement
To achieve the core functionalities of CHECKPOINT, the following algorithms are use. These can be integrated with the tech stack for efficient matching, routing, and fare calculation:

Dijkstra's Algorithm or A Search* 🔍: For finding the shortest path between pickup/drop-off points using Google Maps API data. This optimizes routes for shared rides.
Why Needed: Ensures minimal distance and time for matched users.
Study Sources:
📘 GeeksforGeeks: Dijkstra's Algorithm
📘 Wikipedia: A* Search Algorithm
📖 Book: "Introduction to Algorithms" by Thomas H. Cormen (Chapter on Graph Algorithms)

K-Nearest Neighbors (KNN) or Spatial Indexing (e.g., R-Tree) 📍: For matching users based on proximity and route overlap.
Why Needed: Quickly identifies potential ride-sharing partners from a pool of users.
Study Sources:
📘 GeeksforGeeks: K-Nearest Neighbors
📘 Wikipedia: R-Tree
📖 Tutorial: KDnuggets on Spatial Data Structures

Hungarian Algorithm (for Optimal Assignment) ⚖️: For pairing users in a way that minimizes total cost or distance in batch matching scenarios.
Why Needed: Ensures fair and efficient assignments when multiple users request rides simultaneously.
Study Sources:
📘 GeeksforGeeks: Hungarian Algorithm
📘 Wikipedia: Assignment Problem
📖 Book: "Combinatorial Optimization" by Alexander Schrijver

Proportional Fare Splitting Formula 💵: A simple algorithmic approach: Fare = (Individual Distance / Total Shared Distance) * Total Cost.
Why Needed: Accurately divides costs based on distance.
Study Sources:
📘 Custom Implementation: Basic math with Google Maps distance matrix.
📘 Tutorial: Stack Overflow threads on distance-based calculations.

Implemented these in Java using libraries like GraphHopper (for routing) or Apache Commons Math (for computations), ensuring integration with Redis for caching results.
🏁 Getting Started
📋 Prerequisites
Java 17 ☕
Docker 🐳
Redis 🗄️
Google Maps API Key 🗺️
Git 📂
Maven (for Spring Boot builds) 🔨

⚙️ Installation
Clone the Repository:

git clone https://github.com/username/checkpoint.git
cd checkpoint

Backend Setup (Java Spring Boot):
Ensure Redis is running (locally or via Docker).
Set up Google Maps API key in application.properties.

Build and run:
mvn clean install
mvn spring-boot:run
🌐 Backend runs at http://localhost:8080.

Database Migration (Flyway):
Flyway will automatically handle schema migrations on startup. Configure your database URL in application.properties.

Docker Setup:
Build and run the application:

docker-compose up --build

🔧 Configuration
application.properties: Update with Redis host, Google Maps API key, OAuth2 client details, and JWT secret. 🔑
Environment Variables: For Docker, set vars like SPRING_DATASOURCE_URL in docker-compose.yml. ⚙️

🎯 Usage
Register/login using OAuth2/JWT for secure access.
Request a ride, and the system matches you with a compatible user via algorithms.
Track the ride in real-time with WebSockets and Google Maps.
Fare is automatically split and charged post-ride! 🚀

🤝 Contributing
We welcome contributions to make CHECKPOINT even better! To contribute:
Fork the repository 🍴
Create a feature branch: git checkout -b feature/your-feature 🌿
Commit changes: git commit -m "Add your feature" 💾
Push to the branch: git push origin feature/your-feature 🚀
Open a Pull Request 📬
