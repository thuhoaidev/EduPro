import React from 'react';
import { motion } from 'framer-motion';
import { Card, Tag, Typography, Badge, message, Button, Tooltip, Progress } from 'antd';
import { 
  CopyOutlined, 
  FireOutlined, 
  ClockCircleOutlined, 
  StarOutlined, 
  CrownOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { Category } from '../../interfaces/Category.interface';
import styles from './VoucherCard.module.css';

const { Title, Text } = Typography;

interface VoucherDisplay {
    id: string;
    code: string;
    title: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minAmount: number;
    maxDiscount?: number;
    validFrom: string;
    validTo: string;
    usageLimit: number;
    usedCount: number;
    category: string;
    isActive: boolean;
    isHot?: boolean;
    isNew?: boolean;
    isVipOnly?: boolean;
    isExpired: boolean;
    daysLeft: number;
    status: 'available' | 'unavailable';
    statusMessage: string;
}

interface VoucherCardProps {
    voucher: VoucherDisplay;
    categories: Category[];
}

const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, categories }) => {
    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        message.success(`✅ Đã sao chép mã ${code}!`);
    };

    const getCategoryName = (categoryId: string) => {
        if (!categoryId || categoryId === 'Tất cả') return 'Tất cả';
        const cat = categories.find(c => c._id === categoryId);
        return cat ? cat.name : 'Tất cả';
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'new-user': 'blue',
            'it-courses': 'green',
            'seasonal': 'orange',
            'web-dev': 'purple',
            'mobile-dev': 'cyan',
            'vip': 'gold'
        };
        return colors[category] || 'default';
    };

    const formatDiscount = (voucher: VoucherDisplay) => {
        if (voucher.discountType === 'percentage') {
            return `${voucher.discount}%`;
        }
        return `${voucher.discount.toLocaleString()}đ`;
    };

    const getUsagePercentage = () => {
        return Math.round((voucher.usedCount / voucher.usageLimit) * 100);
    };

    return (
        <motion.div
            className={`${styles.cardWrapper} ${voucher.status === 'unavailable' ? styles.disabled : ''}`}
            whileHover={{ y: -8, scale: 1.03, boxShadow: '0 12px 32px 0 rgba(56,189,248,0.12)' }}
            transition={{ duration: 0.3 }}
        >
            <Card
                className="h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                styles={{ 
                    body: { 
                        padding: 0, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        flexGrow: 1 
                    } 
                }}
            >
                {/* Header with gradient */}
                <div className={styles.headerContainer}>
                    <div className={styles.headerOverlay}></div>
                    
                    {/* Status badges */}
                    <div className={styles.statusBadges}>
                        {voucher.isExpired && (
                            <Badge count={<FireOutlined style={{ color: '#ff4d4f' }} />} />
                        )}
                    </div>

                    {/* Discount display */}
                    <div className={styles.discountDisplay}>
                        <div className={styles.discountContent}>
                            <div className={styles.discountAmount}>
                                {voucher.discountType === 'percentage' ? (
                                    <PercentageOutlined className={styles.discountIcon} />
                                ) : (
                                    <DollarOutlined className={styles.discountIcon} />
                                )}
                                {formatDiscount(voucher)}
                            </div>
                            <div className={styles.discountSubtitle}>
                                {voucher.discountType === 'percentage' && voucher.maxDiscount && (
                                    <div>Tối đa {voucher.maxDiscount.toLocaleString()}đ</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Usage progress */}
                    <div className={styles.usageProgress}>
                        <div className={styles.progressInfo}>
                            <span>Đã sử dụng: {voucher.usedCount}/{voucher.usageLimit}</span>
                            <span>{getUsagePercentage()}%</span>
                        </div>
                        <Progress 
                            percent={getUsagePercentage()} 
                            size="small" 
                            showInfo={false}
                            strokeColor="#ffffff"
                            trailColor="rgba(255,255,255,0.3)"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className={styles.contentContainer}>
                    {/* Title and category */}
                    <div className={styles.titleSection}>
                        <div className={styles.categoryTags}>
                            <Tag color={getCategoryColor(voucher.category)} className={styles.categoryTag}>
                                {getCategoryName(voucher.category)}
                            </Tag>
                            {voucher.status === 'unavailable' && (
                                <Tag color="red" className={styles.statusTag}>Hết voucher</Tag>
                            )}
                        </div>
                        <Title level={4} className={styles.voucherTitle}>
                            {voucher.title}
                        </Title>
                        <Text className={styles.voucherDescription}>
                            {voucher.description}
                        </Text>
                    </div>

                    {/* Conditions */}
                    <div className={styles.conditionsSection}>
                        <div className={styles.conditionItem}>
                            <CheckCircleOutlined className={styles.conditionIcon} style={{ color: '#10b981' }} />
                            <span className={styles.conditionText}>
                                Đơn hàng tối thiểu: {voucher.minAmount.toLocaleString()}đ
                            </span>
                        </div>
                        <div className={styles.conditionItem}>
                            <ClockCircleOutlined className={styles.conditionIcon} style={{ color: '#3b82f6' }} />
                            <span className={styles.conditionText}>
                                {voucher.daysLeft > 0 
                                    ? `Còn ${voucher.daysLeft} ngày` 
                                    : 'Đã hết hạn'
                                }
                            </span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actionSection}>
                        <div className={styles.actionButtons}>
                            <Tooltip title="Sao chép mã">
                                <Button
                                    type="primary"
                                    icon={<CopyOutlined />}
                                    onClick={() => copyToClipboard(voucher.code)}
                                    disabled={voucher.status === 'unavailable'}
                                    className={styles.copyButton}
                                    size="large"
                                >
                                    {voucher.code}
                                </Button>
                            </Tooltip>
                            <Tooltip title="Xem chi tiết">
                                <Button
                                    type="default"
                                    icon={<InfoCircleOutlined />}
                                    className={styles.infoButton}
                                    size="large"
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default VoucherCard; 