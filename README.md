# File Upload Simulator – Frontend Take-home Test

Reflection Questions

## 1. What did you choose to mock the API and why?
I used a custom mock implementation based on setTimeout and in-memory storage. This gave me full control over task timing, cancellation, and error simulation without relying on external resources.

## 2. If you used an AI tool, what parts did it help with?
UI polishing, some logic or design idea like how to desgin retry mechanism, but I designed and implemented the core logic including polling, retry control.

## 3. What tradeoffs or shortcuts did you take?
I chose to use custom hooks and native state to keep the project easy to understand in a short time frame, also just focus on the task's core logic.

## 4. What would you improve or add with more time?
Add unit and integration tests /
Add file queue with progress bars

## 5. What was the trickiest part and how did you debug it?
Handling retry logic and avoiding stale state in poll(). I initially used useState directly, which led to outdated task data during async polling. I fixed it by tracking the latest task state using useRef to ensure polling stops immediately after status changes.
