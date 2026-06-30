package com.eduflow.config;

import com.eduflow.entity.InterviewDomain;
import com.eduflow.entity.InterviewQuestion;
import com.eduflow.repository.InterviewDomainRepository;
import com.eduflow.repository.InterviewQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class InterviewQuestionSeeder implements CommandLineRunner {

    private final InterviewDomainRepository domainRepository;
    private final InterviewQuestionRepository questionRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (domainRepository.count() > 0) {
            return; // Already seeded
        }

        Map<String, List<String>> curatedQuestions = Map.ofEntries(
            Map.entry("Frontend Developer", List.of(
                "What is the difference between React state and props?",
                "How does the virtual DOM work in React?",
                "What are hooks in React? Explain useEffect.",
                "How do you optimize frontend performance?",
                "Difference between SPA and MPA?",
                "Explain the concept of CSS specificity.",
                "How does event delegation work in JavaScript?",
                "What is the Box Model in CSS?",
                "Difference between var, let, and const?",
                "How do promises work in JavaScript?",
                "What is CORS and how do you handle it?",
                "Explain Semantic HTML and its importance.",
                "How do you manage global state in a React app?",
                "What are web components?",
                "How do you test a frontend application?"
            )),
            Map.entry("Backend Developer", List.of(
                "What is REST API?",
                "Difference between GET, POST, PUT, DELETE?",
                "What is authentication vs authorization?",
                "What is middleware in backend frameworks?",
                "How does database connection pooling work?",
                "Explain the MVC architecture pattern.",
                "What is dependency injection and inversion of control?",
                "How do you secure a RESTful API?",
                "What are the benefits of using an ORM?",
                "How do you handle pagination in APIs?",
                "Explain the concept of rate limiting.",
                "How does server-side caching work?",
                "What is the role of a message broker (e.g., RabbitMQ, Kafka)?",
                "Difference between a thread and a process?",
                "How do you debug memory leaks in a backend application?"
            )),
            Map.entry("Full Stack Developer", List.of(
                "Explain frontend–backend communication flow.",
                "What is JWT and how does it work?",
                "How do you deploy a full stack app?",
                "How do you handle API errors?",
                "How do you design scalable applications?",
                "Explain CSRF and how to prevent it.",
                "What is the difference between monolithic and microservice architecture?",
                "How do you handle database migrations?",
                "What is GraphQL and how does it differ from REST?",
                "Explain CI/CD pipelines.",
                "How do you optimize full-stack application load times?",
                "What is server-side rendering (SSR)?",
                "Explain OAuth 2.0 flow.",
                "How do you implement WebSockets for real-time communication?",
                "What is containerization?"
            )),
            Map.entry("Java Developer", List.of(
                "What is OOPs concept in Java?",
                "Difference between ArrayList and LinkedList?",
                "What is Spring Boot?",
                "What is dependency injection?",
                "What is multithreading?",
                "Explain the Java memory model (Heap vs Stack).",
                "What are functional interfaces in Java 8?",
                "Difference between HashMap and ConcurrentHashMap?",
                "Explain the Java Garbage Collection process.",
                "What is the Stream API in Java?",
                "Difference between an abstract class and an interface?",
                "How do you handle exceptions in Spring Boot?",
                "What is JPA and Hibernate?",
                "Explain how synchronized blocks work in Java.",
                "What are the SOLID principles?"
            )),
            Map.entry("Python Developer", List.of(
                "What are Python data types?",
                "What is difference between list and tuple?",
                "What is Flask or Django used for?",
                "What are Python decorators?",
                "What is PIP?",
                "Explain list comprehensions in Python.",
                "What is the Global Interpreter Lock (GIL)?",
                "Difference between deep copy and shallow copy?",
                "How does memory management work in Python?",
                "What are Python generators?",
                "Explain the difference between *args and **kwargs.",
                "How do you handle exceptions in Python?",
                "What are lambda functions?",
                "How do you create a virtual environment in Python?",
                "What is the purpose of the __init__ method?"
            )),
            Map.entry("Cloud Engineer", List.of(
                "What is cloud computing?",
                "Difference between AWS EC2 and S3?",
                "What is scalability in cloud?",
                "What is load balancing?",
                "What is serverless computing?",
                "Explain IaaS vs PaaS vs SaaS.",
                "What is an Auto Scaling Group?",
                "How do you secure a cloud environment?",
                "What is Infrastructure as Code (IaC)?",
                "Difference between a public and private cloud?",
                "What is an IAM role?",
                "How do VPCs work in AWS?",
                "What is cloud orchestration?",
                "Explain the concept of disaster recovery in the cloud.",
                "What are cloud watch and monitoring services?"
            )),
            Map.entry("DevOps Engineer", List.of(
                "What is CI/CD?",
                "What is Docker?",
                "What is Kubernetes?",
                "What is Jenkins used for?",
                "Difference between container and VM?",
                "Explain the concept of GitOps.",
                "How do you scale a Kubernetes cluster?",
                "What is Terraform used for?",
                "How do you monitor infrastructure health?",
                "Explain Blue-Green deployment.",
                "What is configuration management (e.g., Ansible, Chef)?",
                "How do you manage secrets in CI/CD pipelines?",
                "What is Prometheus and Grafana?",
                "Explain a typical Dockerfile structure.",
                "What is a service mesh?"
            )),
            Map.entry("Data Analyst", List.of(
                "What is data cleaning?",
                "What is pandas used for?",
                "Difference between structured and unstructured data?",
                "What is data visualization?",
                "What is SQL used for in analytics?",
                "Explain the concept of a normal distribution.",
                "What are common methods for handling missing data?",
                "Difference between a join and a union in SQL?",
                "What is an outlier and how do you handle it?",
                "Explain A/B testing.",
                "What are KPI dashboards?",
                "How do you write a complex SQL aggregation query?",
                "What is the difference between correlation and causation?",
                "Explain time-series analysis.",
                "What tools do you use for data warehousing?"
            )),
            Map.entry("AI/ML Engineer", List.of(
                "What is machine learning?",
                "Difference between AI, ML, DL?",
                "What is training and testing data?",
                "What is overfitting?",
                "What is a neural network?",
                "Explain the Bias-Variance tradeoff.",
                "What is cross-validation?",
                "Difference between supervised and unsupervised learning?",
                "What is a confusion matrix?",
                "Explain gradient descent.",
                "What is natural language processing (NLP)?",
                "What are convolutional neural networks (CNNs)?",
                "How do you handle imbalanced datasets?",
                "What is an activation function?",
                "Explain reinforcement learning."
            )),
            Map.entry("Mobile App Developer", List.of(
                "Difference between native and hybrid apps?",
                "What is Flutter?",
                "What is activity lifecycle in Android?",
                "What is API integration in mobile apps?",
                "How do you handle app performance?",
                "Explain state management in Flutter or React Native.",
                "What are Intents in Android?",
                "Difference between stateful and stateless widgets?",
                "How do you handle offline caching in mobile apps?",
                "What is Core Data or Room Database?",
                "How do push notifications work?",
                "Explain memory management in mobile development.",
                "What are App Store submission guidelines?",
                "How do you ensure mobile app security?",
                "What is responsive design in mobile UI?"
            )),
            Map.entry("Cybersecurity Analyst", List.of(
                "What is phishing?",
                "What is encryption?",
                "What is firewall?",
                "What is SQL injection?",
                "What is penetration testing?",
                "Difference between asymmetric and symmetric encryption?",
                "What is a DDoS attack?",
                "Explain the CIA triad.",
                "What is multi-factor authentication (MFA)?",
                "How do you prevent Cross-Site Scripting (XSS)?",
                "What is a VPN and how does it secure data?",
                "Explain social engineering.",
                "What is an Intrusion Detection System (IDS)?",
                "How do you respond to a data breach?",
                "What is malware analysis?"
            )),
            Map.entry("UI/UX Designer", List.of(
                "What is UX vs UI?",
                "What is wireframing?",
                "What is user journey?",
                "What is usability testing?",
                "What makes a good design?",
                "Explain color theory in UI design.",
                "What is a design system?",
                "Difference between a prototype and a mockup?",
                "How do you conduct user research?",
                "What is accessibility in design (a11y)?",
                "Explain heuristic evaluation.",
                "What is responsive vs adaptive design?",
                "How do you use Figma or Adobe XD effectively?",
                "What is micro-interaction?",
                "How do you handle negative user feedback?"
            )),
            Map.entry("QA / Software Tester", List.of(
                "What is manual testing?",
                "What is automation testing?",
                "What is a test case?",
                "What is regression testing?",
                "What is bug lifecycle?",
                "Difference between black box and white box testing?",
                "What is exploratory testing?",
                "Explain the testing pyramid.",
                "What is smoke testing vs sanity testing?",
                "How do you write a good bug report?",
                "What is continuous testing in CI/CD?",
                "What are Selenium and Appium used for?",
                "How do you test an API?",
                "What is load testing vs stress testing?",
                "How do you prioritize bugs?"
            )),
            Map.entry("System Design Engineer", List.of(
                "What is scalability?",
                "What is load balancing?",
                "What is caching?",
                "What is microservices?",
                "How does a URL shortener work?",
                "Difference between vertical and horizontal scaling?",
                "What is database sharding?",
                "Explain the CAP theorem.",
                "How would you design a chat application like WhatsApp?",
                "What is a Content Delivery Network (CDN)?",
                "How do you design a rate limiter?",
                "What is consistent hashing?",
                "How do you handle eventual consistency?",
                "Design an e-commerce checkout system.",
                "What are message queues and why are they used?"
            )),
            Map.entry("Database Administrator", List.of(
                "What is normalization?",
                "What is SQL vs NoSQL?",
                "What is indexing?",
                "What is ACID property?",
                "What is query optimization?",
                "Explain the different types of joins in SQL.",
                "What is a stored procedure?",
                "How do you handle database deadlocks?",
                "What is a database transaction?",
                "Difference between primary key and unique key?",
                "How do you backup and restore a database?",
                "What is replication vs partitioning?",
                "How does a B-Tree index work?",
                "Explain the role of foreign keys.",
                "What is data warehousing?"
            ))
        );

        for (Map.Entry<String, List<String>> entry : curatedQuestions.entrySet()) {
            InterviewDomain domain = InterviewDomain.builder()
                .name(entry.getKey())
                .description(entry.getKey() + " interview domain")
                .isActive(true)
                .build();
            domain = domainRepository.save(domain);

            for (String q : entry.getValue()) {
                InterviewQuestion question = InterviewQuestion.builder()
                    .domain(domain)
                    .question(q)
                    .difficulty("medium")
                    .isActive(true)
                    .build();
                questionRepository.save(question);
            }
        }
    }
}
