# 📚 Studeezy – Your AI-Powered Study Buddy

Studeezy is your ultimate companion for smarter, easier, and more collaborative learning.  
Built with ❤️ for hackathons, powered by AI, and designed for students who want to **learn better, not harder**.

> ✨ Upload notes. 🏷️ Tag and organize. 🔁 Revise with flashcards. 🧠 Take quizzes. 📊 Track progress.  
> All in one place. All with **Studeezy**.

---

## 🚀 Features

🎯 **Note Uploading & Management**  
- Upload handwritten or typed notes.  
- OCR processing converts images to searchable text.  
- Add tags, group notes by subject or topic.

👥 **Peer-to-Peer Sharing**  
- Share your resources with friends or your entire class.  
- Build a shared knowledge pool together.

🧠 **AI-Generated Quizzes & Flashcards**  
- Studeezy auto-generates quizzes and flashcards from your notes using **Gemini AI**.  
- Smart revision made simple.

📈 **Learning Analytics**  
- Visualize your study patterns, quiz scores, time spent per topic.  
- Personalized insights for better planning.

🔐 **Seamless Auth & Security**  
- Powered by **Civic** for decentralized, privacy-respecting authentication.

🗃️ **Storage & Scalability**  
- Notes stored using **EdgeStore** for lightning-fast access.  
- **MongoDB** handles user data, quizzes, flashcards, and analytics.

---

## 🛠️ Tech Stack

| Tech        | Purpose                               |
|-------------|----------------------------------------|
| **Next.js** | React framework for server-side magic  |
| **TypeScript** | Strong typing and better dev experience |
| **Gemini**  | AI model for flashcard & quiz gen      |
| **MongoDB** | Database for user data and notes       |
| **EdgeStore** | Secure and scalable file storage      |
| **Civic**   | Web3-style authentication              |

---

## 🧪 How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/your-username/studeezy.git
cd studeezy

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a `.env.local` file with the following:
# (Replace the values with your actual credentials)

NEXT_PUBLIC_EDGESTORE_API_KEY=your_edgestore_key
MONGODB_URI=your_mongodb_uri
CIVIC_APP_ID=your_civic_id
GEMINI_API_KEY=your_gemini_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# 4. Run the dev server
npm run dev
