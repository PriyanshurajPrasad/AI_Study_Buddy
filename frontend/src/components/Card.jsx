const Card = ({ children, className = '', hover = false, onClick, gradient = false }) => {
  const baseClasses = gradient
    ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-6'
    : 'bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-6';
  
  const hoverClasses = hover
    ? 'hover:shadow-2xl hover:scale-[1.02] hover:border-white/20 transition-all duration-300 cursor-pointer'
    : 'transition-all duration-200';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
