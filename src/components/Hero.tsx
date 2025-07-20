import React from 'react';
import { BookOpen, FileText, FileQuestion, PenTool } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onExplore: () => void;
}

export function Hero({ onGetStarted, onExplore }: HeroProps) {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Share Knowledge,
              <br />
              <span className="text-teal-300">Succeed Together</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for college students to share academic resources, 
              collaborate on studies, and build a stronger learning community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={onGetStarted}
                className="bg-teal-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started 
              </button>
              <button
                onClick={onExplore}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Browse resources
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white">
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Your Notes</h3>
                <p className="text-blue-100 text-sm">Access comprehensive study notes</p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white">
                <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Find Syllabus</h3>
                <p className="text-blue-100 text-sm">Complete course syllabi available</p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white">
                <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileQuestion className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Previous Year Questions</h3>
                <p className="text-blue-100 text-sm">PYQs for exam preparation</p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white">
                <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PenTool className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Assignments & Projects</h3>
                <p className="text-blue-100 text-sm">Sample assignments and solutions</p>
              </div>
            </div>
          </div>
        </div>
        {/* About Us Section */}
        <div className="relative bg-white py-16 px-4 sm:px-6 lg:px-8 shadow-inner">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">About Us</h2>
            <p className="text-lg text-gray-700 mb-4">
              StudyShare is a student-driven platform dedicated to making academic resources accessible to everyone. Our mission is to empower students to learn, share, and succeed together by providing a collaborative space for notes, syllabi, previous year questions, and more.
            </p>
          </div>
        </div>
        {/* Contact Us Section */}
        <div className="relative bg-blue-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-700 mb-6">
              Have questions, feedback, or want to partner with us? Reach out at <a href="mailto:iiiatulll007@gmail.com" className="text-blue-600 underline">studyshare.help@gmail.com</a> and we'll get back to you soon!
            </p>
          </div>
        </div>
        {/* Final Call to Action Section */}
        <div className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to join the StudyShare community?</h2>
            <p className="text-lg text-blue-100 mb-8">Sign in with Google and start sharing or exploring resources today!</p>
            <button
              onClick={onGetStarted}
              className="bg-teal-500 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-teal-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
      {/* Footer Section */}
      <footer className="bg-blue-900 text-blue-100 py-8 px-4 mt-0 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="font-bold text-lg">StudyShare</span> &copy; {new Date().getFullYear()}<br />
            <span className="text-blue-300 text-sm">Empowering students to learn and share together.</span>
          </div>
        </div>
      </footer>
    </>
  );
}