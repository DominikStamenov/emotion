export function Logo() {
    return (
      <div className="brand">
        <span className="brandMark" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <path
              d="M14 14C25 18 35 24 49 32C35 40 25 46 14 50C21 42 27 36 27 32C27 28 21 22 14 14Z"
              fill="currentColor"
            />
  
            <path
              d="M19 25L35 32L19 39"
              fill="none"
              stroke="#08080a"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          </svg>
        </span>
  
        <span className="brandCopy">
          <strong>eMotion</strong>
          <small>Digital Studio</small>
        </span>
      </div>
    );
  }