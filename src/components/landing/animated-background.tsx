export function AnimatedBackground() {
  return (
    <>
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-64 h-64 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-[#323e65] to-[#a7bfd9] rounded-full blob-animation-1" />
        </div>
        
        <div className="absolute bottom-32 right-1/3 w-48 h-48 opacity-15">
          <div className="w-full h-full bg-gradient-to-tl from-[#a7bfd9] to-[#323e65] rounded-full blob-animation-2" />
        </div>
        
        <div className="absolute top-1/2 right-20 w-32 h-32 opacity-25">
          <div className="w-full h-full bg-gradient-to-br from-[#609ae1] to-[#a7bfd9] rounded-full blob-animation-3" />
        </div>
        
        <div className="absolute -top-32 -left-32 w-96 h-96 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-[#323e65] via-[#a7bfd9] to-[#609ae1] rounded-full blob-animation-4" />
        </div>
        
        <div className="absolute bottom-20 left-16 w-20 h-20 opacity-30">
          <div className="w-full h-full bg-gradient-to-tr from-[#609ae1] to-[#a7bfd9] rounded-full blob-animation-5" />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob-float-1 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          25% {
            transform: translate(20px, -20px) scale(1.1) rotate(90deg);
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            transform: translate(-10px, 20px) scale(0.9) rotate(180deg);
            border-radius: 50% 60% 30% 60% / 40% 50% 60% 30%;
          }
          75% {
            transform: translate(-20px, -10px) scale(1.05) rotate(270deg);
            border-radius: 70% 30% 50% 60% / 30% 40% 60% 50%;
          }
        }

        @keyframes blob-float-2 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 40% 60% 60% 40% / 60% 30% 60% 40%;
          }
          33% {
            transform: translate(-15px, 25px) scale(1.15) rotate(120deg);
            border-radius: 60% 40% 30% 70% / 40% 60% 50% 30%;
          }
          66% {
            transform: translate(25px, -15px) scale(0.85) rotate(240deg);
            border-radius: 30% 70% 40% 60% / 50% 40% 30% 60%;
          }
        }

        @keyframes blob-float-3 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 50% 50% 30% 70% / 30% 60% 40% 60%;
          }
          50% {
            transform: translate(30px, 15px) scale(1.2) rotate(180deg);
            border-radius: 70% 30% 60% 40% / 60% 40% 30% 50%;
          }
        }

        @keyframes blob-float-4 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 60% 40% 40% 60% / 70% 30% 60% 40%;
          }
          20% {
            transform: translate(10px, -25px) scale(0.95) rotate(72deg);
            border-radius: 40% 60% 70% 30% / 40% 60% 30% 70%;
          }
          40% {
            transform: translate(-20px, 10px) scale(1.1) rotate(144deg);
            border-radius: 70% 30% 40% 60% / 30% 70% 60% 40%;
          }
          60% {
            transform: translate(15px, 20px) scale(0.9) rotate(216deg);
            border-radius: 30% 70% 60% 40% / 60% 40% 70% 30%;
          }
          80% {
            transform: translate(-10px, -15px) scale(1.05) rotate(288deg);
            border-radius: 60% 40% 30% 70% / 30% 40% 60% 70%;
          }
        }

        @keyframes blob-float-5 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
            border-radius: 45% 55% 60% 40% / 55% 45% 40% 60%;
          }
          33% {
            transform: translate(20px, -10px) scale(1.3);
            border-radius: 60% 40% 45% 55% / 40% 60% 55% 45%;
          }
          66% {
            transform: translate(-15px, 20px) scale(0.8);
            border-radius: 55% 45% 40% 60% / 60% 40% 45% 55%;
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .blob-animation-1 {
          animation: blob-float-1 20s ease-in-out infinite;
        }

        .blob-animation-2 {
          animation: blob-float-2 25s ease-in-out infinite;
        }

        .blob-animation-3 {
          animation: blob-float-3 15s ease-in-out infinite;
        }

        .blob-animation-4 {
          animation: blob-float-4 30s ease-in-out infinite;
        }

        .blob-animation-5 {
          animation: blob-float-5 18s ease-in-out infinite;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>
    </>
  )
}