const DashboardStyles = () => (
  <style>{`
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse-glow {
      0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
      100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }

    @keyframes dashboard-horizontal-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-33.333333%); }
    }

    @keyframes dashboard-vertical-scroll {
      0% { transform: translateY(0); }
      100% { transform: translateY(-50%); }
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }

    .animate-float-delayed {
      animation: float 8s ease-in-out infinite 4s;
    }

    .animate-enter {
      animation: fade-in-up 0.6s ease-out forwards;
    }

    .animate-enter-delay-1 {
      animation: fade-in-up 0.6s ease-out 0.1s forwards;
      opacity: 0;
    }

    .animate-enter-delay-2 {
      animation: fade-in-up 0.6s ease-out 0.2s forwards;
      opacity: 0;
    }

    .animate-enter-delay-3 {
      animation: fade-in-up 0.6s ease-out 0.3s forwards;
      opacity: 0;
    }

    .animate-infinite-scroll {
      animation: dashboard-horizontal-scroll 40s linear infinite;
    }

    .animate-infinite-scroll:hover {
      animation-play-state: paused;
    }

    .animate-vertical-scroll {
      animation: dashboard-vertical-scroll 30s linear infinite;
    }

    .hover\\:pause-animation:hover {
      animation-play-state: paused;
    }

    html {
      scroll-behavior: smooth;
    }

    @media (prefers-reduced-motion: reduce) {
      .animate-float,
      .animate-float-delayed,
      .animate-enter,
      .animate-enter-delay-1,
      .animate-enter-delay-2,
      .animate-enter-delay-3,
      .animate-infinite-scroll,
      .animate-vertical-scroll {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }

      html {
        scroll-behavior: auto;
      }
    }
  `}</style>
);

export default DashboardStyles;
