import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({ rating, size = 14, showNumber = false, reviewCount = 0 }) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.3;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<FaStar key={i} size={size} color="var(--star)" />);
        } else if (i === fullStars && hasHalf) {
            stars.push(<FaStarHalfAlt key={i} size={size} color="var(--star)" />);
        } else {
            stars.push(<FaRegStar key={i} size={size} color="var(--star)" />);
        }
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>
            {showNumber && <span style={{ fontSize: size - 1, color: 'var(--gray-600)', marginLeft: '4px' }}>{rating}</span>}
            {reviewCount > 0 && (
                <span style={{ fontSize: size - 1, color: 'var(--gray-500)', marginLeft: '2px' }}>
                    ({reviewCount.toLocaleString()})
                </span>
            )}
        </div>
    );
}
