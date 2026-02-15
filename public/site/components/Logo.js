function Logo({ className = "w-6 h-6", color = "currentColor" }) {
    const logoUrl = "https://app.trickle.so/storage/public/images/usr_19c684eaa8000001/05011032-1d4b-46cc-ac8f-02db9bc085d4.svg";
    
    return (
        <img 
            src={logoUrl} 
            alt="VEXURA Logo" 
            className={`${className} object-contain`}
        />
    );
}
