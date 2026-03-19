import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiGrid, FiList, FiChevronDown, FiX, FiFilter } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import { categories, brands, products as mockProducts } from '../data/data';
import { getProducts } from '../services/productsService';
import './ProductListPage.css';

const categoryNameMap = {
    smartphones: 'Điện thoại',
    laptops: 'Laptop',
    audio: 'Âm thanh',
    cameras: 'Máy ảnh',
    tablets: 'Máy tính bảng',
    accessories: 'Phụ kiện',
};

const priceRanges = [
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: '20 - 50 triệu', min: 20000000, max: 50000000 },
    { label: 'Trên 50 triệu', min: 50000000, max: Infinity },
];

const applyLocalFilters = ({
    source,
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedPriceRange,
    sortBy,
}) => {
    let result = [...source];

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
            (p) =>
                String(p.name || '').toLowerCase().includes(q) ||
                String(p.description || '').toLowerCase().includes(q)
        );
    }

    if (selectedCategories.length > 0) {
        result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
        result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedPriceRange !== null) {
        const range = priceRanges[selectedPriceRange];
        result = result.filter((p) => Number(p.price || 0) >= range.min && Number(p.price || 0) < range.max);
    }

    switch (sortBy) {
        case 'price-low':
            result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
            break;
        case 'price-high':
            result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
            break;
        case 'rating':
            result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
            break;
        case 'newest':
            result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
            break;
        default:
            break;
    }

    return result;
};

export default function ProductListPage() {
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category') || '';
    const searchQuery = searchParams.get('search') || '';

    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('relevance');
    const [selectedCategories, setSelectedCategories] = useState(categoryParam ? [categoryParam] : []);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [productList, setProductList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        setSelectedCategories(categoryParam ? [categoryParam] : []);
        setCurrentPage(1);
    }, [categoryParam]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const toggleCategory = (slug) => {
        setSelectedCategories((prev) =>
            prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
        );
    };

    const toggleBrand = (brand) => {
        setSelectedBrands((prev) =>
            prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
        );
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setSelectedPriceRange(null);
        setSelectedRating(0);
        setCurrentPage(1);
    };

    useEffect(() => {
        let ignore = false;

        const loadProducts = async () => {
            try {
                setIsLoading(true);
                setApiError('');

                const selectedRange =
                    selectedPriceRange !== null ? priceRanges[selectedPriceRange] : null;

                const sortMap = {
                    relevance: '-createdAt',
                    'price-low': 'price',
                    'price-high': '-price',
                    rating: '-rating',
                    newest: '-createdAt',
                };

                const response = await getProducts({
                    category: selectedCategories[0] || '',
                    search: searchQuery,
                    minPrice: selectedRange ? selectedRange.min : '',
                    maxPrice: selectedRange && Number.isFinite(selectedRange.max) ? selectedRange.max : '',
                    brand: selectedBrands[0] || '',
                    sort: sortMap[sortBy] || '-createdAt',
                    page: currentPage,
                    limit: 12,
                });

                if (ignore) return;

                setProductList(response.products || []);
                setTotalPages(response.pages || 1);
            } catch (error) {
                if (ignore) return;

                const fallback = applyLocalFilters({
                    source: mockProducts,
                    searchQuery,
                    selectedCategories,
                    selectedBrands,
                    selectedPriceRange,
                    sortBy,
                });

                const pageSize = 12;
                const pages = Math.max(1, Math.ceil(fallback.length / pageSize));
                const safePage = Math.min(currentPage, pages);
                const start = (safePage - 1) * pageSize;
                const end = start + pageSize;

                setApiError('');
                setProductList(fallback.slice(start, end));
                setTotalPages(pages);

                if (safePage !== currentPage) {
                    setCurrentPage(safePage);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            ignore = true;
        };
    }, [searchQuery, selectedCategories, selectedBrands, selectedPriceRange, sortBy, currentPage]);

    const filteredProducts = useMemo(() => {
        let result = [...productList];

        if (selectedCategories.length > 1) {
            result = result.filter((p) => selectedCategories.includes(p.category));
        }

        if (selectedBrands.length > 1) {
            result = result.filter((p) => selectedBrands.includes(p.brand));
        }

        if (selectedRating > 0) {
            result = result.filter((p) => Number(p.rating || 0) >= selectedRating);
        }

        return result;
    }, [productList, selectedCategories, selectedBrands, selectedRating]);

    const activeFilterCount = selectedCategories.length + selectedBrands.length + (selectedPriceRange !== null ? 1 : 0) + (selectedRating > 0 ? 1 : 0);

    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxVisible = 5;
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + maxVisible - 1);

        for (let p = start; p <= end; p += 1) {
            pages.push(p);
        }

        return pages;
    }, [currentPage, totalPages]);

    const renderFilters = () => (
        <div className="plp__filters-content">
            {/* Bộ lọc đang áp dụng */}
            {activeFilterCount > 0 && (
                <div className="plp__active-filters">
                    <div className="plp__active-filters-header">
                        <span>{activeFilterCount} bộ lọc đang áp dụng</span>
                        <button onClick={clearAllFilters} className="plp__clear-all">Xóa tất cả</button>
                    </div>
                    <div className="plp__filter-pills">
                        {selectedCategories.map((c) => (
                            <span key={c} className="plp__filter-pill">
                                {categoryNameMap[c] || c} <FiX size={12} onClick={() => toggleCategory(c)} />
                            </span>
                        ))}
                        {selectedBrands.map((b) => (
                            <span key={b} className="plp__filter-pill">
                                {b} <FiX size={12} onClick={() => toggleBrand(b)} />
                            </span>
                        ))}
                        {selectedRating > 0 && (
                            <span className="plp__filter-pill">
                                {selectedRating}★ trở lên <FiX size={12} onClick={() => setSelectedRating(0)} />
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Danh mục */}
            <div className="plp__filter-group">
                <h3 className="plp__filter-title">Danh mục</h3>
                {categories.map((cat) => (
                    <label key={cat.id} className="plp__filter-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.slug)}
                            onChange={() => toggleCategory(cat.slug)}
                        />
                        <span className="plp__checkbox-custom"></span>
                        <span>{cat.name}</span>
                        <span className="plp__filter-count">({cat.count})</span>
                    </label>
                ))}
            </div>

            {/* Khoảng giá */}
            <div className="plp__filter-group">
                <h3 className="plp__filter-title">Khoảng giá</h3>
                {priceRanges.map((range, idx) => (
                    <label key={idx} className="plp__filter-checkbox">
                        <input
                            type="radio"
                            name="price"
                            checked={selectedPriceRange === idx}
                            onChange={() => setSelectedPriceRange(selectedPriceRange === idx ? null : idx)}
                        />
                        <span className="plp__checkbox-custom plp__checkbox-custom--radio"></span>
                        <span>{range.label}</span>
                    </label>
                ))}
            </div>

            {/* Thương hiệu */}
            <div className="plp__filter-group">
                <h3 className="plp__filter-title">Thương hiệu</h3>
                {brands.slice(0, 8).map((brand) => (
                    <label key={brand} className="plp__filter-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                        />
                        <span className="plp__checkbox-custom"></span>
                        <span>{brand}</span>
                    </label>
                ))}
            </div>

            {/* Đánh giá */}
            <div className="plp__filter-group">
                <h3 className="plp__filter-title">Đánh giá</h3>
                {[4, 3, 2, 1].map((r) => (
                    <button
                        key={r}
                        className={`plp__rating-btn ${selectedRating === r ? 'plp__rating-btn--active' : ''}`}
                        onClick={() => setSelectedRating(selectedRating === r ? 0 : r)}
                    >
                        <div className="plp__rating-stars">
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} size={14} color={i < r ? 'var(--star)' : 'var(--gray-300)'} />
                            ))}
                        </div>
                        <span>trở lên</span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="plp">
            <div className="container">
                {/* Đường dẫn */}
                <nav className="plp__breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span>/</span>
                    <span>Sản phẩm</span>
                    {categoryParam && (
                        <>
                            <span>/</span>
                            <span className="plp__breadcrumb-current">{categoryNameMap[categoryParam] || categoryParam}</span>
                        </>
                    )}
                </nav>

                <div className="plp__layout">
                    {/* Bộ lọc bên trái */}
                    <aside className={`plp__sidebar ${mobileFiltersOpen ? 'plp__sidebar--open' : ''}`}>
                        <div className="plp__sidebar-header">
                            <h2 className="plp__sidebar-title"><FiFilter /> Bộ lọc</h2>
                            <button className="plp__sidebar-close" onClick={() => setMobileFiltersOpen(false)}>
                                <FiX size={20} />
                            </button>
                        </div>
                        {renderFilters()}
                    </aside>
                    {mobileFiltersOpen && <div className="plp__overlay" onClick={() => setMobileFiltersOpen(false)}></div>}

                    {/* Nội dung */}
                    <main className="plp__content">
                        {/* Thanh công cụ */}
                        <div className="plp__toolbar">
                            <div className="plp__toolbar-left">
                                <button className="plp__mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)}>
                                    <FiFilter /> Bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
                                </button>
                                <span className="plp__result-count">
                                    Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
                                </span>
                            </div>
                            <div className="plp__toolbar-right">
                                <div className="plp__sort">
                                    <span>Sắp xếp:</span>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="plp__sort-select">
                                        <option value="relevance">Phù hợp nhất</option>
                                        <option value="price-low">Giá: Thấp đến Cao</option>
                                        <option value="price-high">Giá: Cao đến Thấp</option>
                                        <option value="rating">Đánh giá cao nhất</option>
                                        <option value="newest">Mới nhất</option>
                                    </select>
                                    <FiChevronDown className="plp__sort-arrow" />
                                </div>
                                <div className="plp__view-toggle">
                                    <button
                                        className={`plp__view-btn ${viewMode === 'grid' ? 'plp__view-btn--active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                        title="Dạng lưới"
                                    >
                                        <FiGrid size={18} />
                                    </button>
                                    <button
                                        className={`plp__view-btn ${viewMode === 'list' ? 'plp__view-btn--active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                        title="Dạng danh sách"
                                    >
                                        <FiList size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sản phẩm */}
                        {isLoading && (
                            <div className="plp__empty">
                                <h3>Đang tải sản phẩm...</h3>
                            </div>
                        )}

                        {!isLoading && apiError && (
                            <div className="plp__empty">
                                <h3>Không thể tải sản phẩm</h3>
                                <p>{apiError}</p>
                            </div>
                        )}

                        {!isLoading && !apiError && filteredProducts.length > 0 ? (
                            <div className={`plp__products ${viewMode === 'list' ? 'plp__products--list' : ''}`}>
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} listView={viewMode === 'list'} />
                                ))}
                            </div>
                        ) : !isLoading && !apiError ? (
                            <div className="plp__empty">
                                <span className="plp__empty-icon">🔍</span>
                                <h3>Không tìm thấy sản phẩm</h3>
                                <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                                <button className="btn btn-primary" onClick={clearAllFilters}>Xóa tất cả bộ lọc</button>
                            </div>
                        ) : null}

                        {/* Phân trang */}
                        {!isLoading && !apiError && filteredProducts.length > 0 && (
                            <div className="plp__pagination">
                                <button
                                    className={`plp__page-btn ${currentPage <= 1 ? 'plp__page-btn--disabled' : ''}`}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                >
                                    &lt; Trước
                                </button>

                                {pageNumbers.map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        className={`plp__page-btn ${currentPage === pageNum ? 'plp__page-btn--active' : ''}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    className={`plp__page-btn ${currentPage >= totalPages ? 'plp__page-btn--disabled' : ''}`}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                >
                                    Sau &gt;
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
