export default function ApplicationLogo(props) {
    const { className = 'w-10 h-10', ...rest } = props;
    return (
        <img
            src="/icon.png"
            alt="TKA LMS Logo"
            className={`object-contain ${className}`}
            {...rest}
        />
    );
}
