function Logo({ className = "w-6 h-6", color = "currentColor" }) {
    const logoUrl = "https://app.trickle.so/storage/public/images/usr_19c684eaa8000001/0b715318-c454-4fa4-862a-8ff08f6a6c21.png";
    
    return (
        <img 
            src={logoUrl} 
            alt="VEXURA Logo" 
            className={`${className} object-contain`}
        />
    );
}
