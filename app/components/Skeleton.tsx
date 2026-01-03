import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    borderRadius,
    style,
    ...props
}) => {
    const styles: React.CSSProperties = {
        width: width,
        height: height,
        borderRadius: borderRadius,
        ...style,
    };

    return (
        <div
            className={`loading-skeleton ${className}`}
            style={styles}
            {...props}
        />
    );
};

export default Skeleton;
