function Logo({ className = "w-6 h-6", color = "currentColor" }) {
    const logoUrl = "https://app.trickle.so/storage/public/images/usr_19c684eaa8000001/18d4bc74-04d9-4470-9169-71d5e0b57924.Untitled";
    
    return (
        <img 
            src={logoUrl} 
            alt="VEXURA Logo" 
            className={`${className} object-contain`}
        />
    );
}