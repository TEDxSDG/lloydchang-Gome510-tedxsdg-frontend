'use client'
import { useEffect, useState } from 'react';
import Link from "next/link";

interface Project {
  id: string;
  name: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black bg-[url('/assets/SDGs-Colours.png')] bg-cover bg-center bg-no-repeat">
      {/* Header */}
      <header className="p-4 bg-red-600">
        <h1 className="text-2xl font-bold text-white">TEDxSDG</h1>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl bg-white bg-opacity-90 p-8 rounded-lg">
          {projects.length > 0 ? (
            <>
              <h2 className="text-4xl font-bold mb-4 text-red-600">Your Projects</h2>
              <ul className="mb-8">
                {projects.map((project) => (
                  <li key={project.id} className="mb-2">
                    <Link 
                      href={`/generate/inspiration`} 
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        localStorage.setItem('activeProject', JSON.stringify(project));
                      }}
                    >
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/generate"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Start New Project
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-4 text-red-600">Welcome to TEDxSDG</h2>
              <p className="text-xl mb-8">
                At TEDxSDG, we make turning your ideas into action seamless. Whether you're inspired by a specific SDG goal or have an idea of your own, our platform guides you through four key steps: Inspiration, Planning, Funding, and Distribution.
              </p>
              <p className="text-xl mb-8">
                Start by submitting your idea or exploring SDG goals for inspiration. Our AI will then create a tailored business plan, complete with investor connections, a professional pitch deck, and grant proposal resources. Everything you need to bring your vision to life is just a few clicks away!
              </p>
              <p className="text-xl mb-8">
                Ready to create real-world change? TEDxSDG is here to guide you every step of the way.
              </p>
              <div className="text-center">
                <Link
                  href="/generate/inspiration"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Get Started
                </Link>
              </div>
              <button
                onClick={() => {
                  const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
                  const newProject = { id: Date.now(), name: 'New Project' };
                  const updatedProjects = [...existingProjects, newProject];
                  localStorage.setItem('projects', JSON.stringify(updatedProjects));
                  setProjects(updatedProjects)
                }}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Add Test Project
              </button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-white bg-black bg-opacity-80">
        © 2024 TEDxSDG. All rights reserved.
      </footer>
    </div>
  );
}
