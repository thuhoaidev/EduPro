import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onSearch: (value: string) => void;
    defaultValue?: string;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, defaultValue, placeholder }) => {
    return (
        <div className={styles.searchContainer}>
            <Input
                className={styles.searchInput}
                placeholder={placeholder || "Tìm kiếm khóa học, bài viết, video..."}
                defaultValue={defaultValue}
                onPressEnter={(e) => onSearch(e.currentTarget.value)}
                suffix={
                    <button 
                        className={styles.searchButton} 
                        onClick={(e) => {
                            const input = (e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement);
                            if (input) onSearch(input.value);
                        }}
                    >
                        <SearchOutlined />
                    </button>
                }
            />
        </div>
    );
};

export default SearchBar; 