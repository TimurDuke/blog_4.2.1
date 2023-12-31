import React, {useEffect, useState} from 'react';
import {Pagination} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {
    useAddFavoriteArticleMutation,
    useDeleteFavoriteArticleMutation,
    useGetAllArticlesQuery
} from "../../services/ArticlesService";
import ArticleCard from "../../components/ArticleCard";
import {formattedDate} from "../../utils/articleUtils";
import {setPage} from "../../store/actions/articlesActions";
import {loginPath, logoutPath, registerPath} from "../../routes/routePaths";
import SkeletonArticleCard from "../../components/SkeletonArticleCard";
import {ARTICLES_LIMIT_COUNT} from "../../constants";

const Articles = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const { page } = useSelector(state => state.articles);
    const { user } = useSelector(state => state.user);
    const [queryParams, setQueryParams] = useState(null);

    const currentPage = (page !== searchParams.get('page')) && searchParams.get('page') ? searchParams.get('page') : page;

    const { data, isFetching, refetch} = useGetAllArticlesQuery({currentPage, queryParams});

    const [addFavorite, {isLoading: addFavoriteLoading}] = useAddFavoriteArticleMutation();
    const [deleteFavorite, {isLoading: deleteFavoriteLoading}] = useDeleteFavoriteArticleMutation();

    const fromPath = location.state?.from;

    useEffect(() => {
        if (location?.pathname) {
            switch (location.pathname) {
                case '/user/articles':
                    setQueryParams({query: 'author', params: user.username});
                    break;
                case '/user/articles/favorite':
                    setQueryParams({query: 'favorited', params: user.username});
                    break;
                default:
                    break;
            }
        }
    }, [location, user?.username]);

    useEffect(() => {
        const authPaths = [registerPath, loginPath, logoutPath];

        if (authPaths.includes(fromPath)) {
            // Re-fetch if user has performed some auth actions
            refetch();
        }

    }, [fromPath, refetch, user]);

    useEffect(() => {
        if (location.state?.articlesPage) {
            const { articlesPage } = location.state;
            dispatch(setPage(articlesPage));

            // Clear location state
            navigate(location.pathname, { replace: true, state: {} });
        }

    }, [dispatch, location, navigate]);

    const isLoading = isFetching || addFavoriteLoading || deleteFavoriteLoading;

    const paginationHandler = (_, selectedPage) => {
        dispatch(setPage(selectedPage));
        setSearchParams({page: selectedPage});
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const addFavoriteHandler = async slug => {
        try {
            if (slug) {
                await addFavorite(slug).unwrap();
            }
            // eslint-disable-next-line no-empty
        } catch (e) {}
    };

    const deleteFavoriteHandler = async slug => {
        try {
            if (slug) {
                await deleteFavorite(slug).unwrap();
            }
            // eslint-disable-next-line no-empty
        } catch (e) {}
    };

    return (
        <>
            {isLoading &&
                (
                    Array.from({ length: ARTICLES_LIMIT_COUNT }, (_, index) => index)
                        .map(index => <SkeletonArticleCard key={index}/>)
                )
            }
            {(!!data?.articles?.length && data?.articlesCount && !isLoading) &&
                <>
                    {data?.articles.map(article => (
                        <ArticleCard
                            key={article.slug}
                            slug={article.slug}
                            title={article.title}
                            description={article.description}
                            favoritesCount={article.favoritesCount}
                            isFavorite={article.favorited}
                            author={article.author}
                            tagList={article.tagList}
                            date={formattedDate(article['createdAt'])}
                            addFavorite={addFavoriteHandler}
                            deleteFavorite={deleteFavoriteHandler}
                        />
                    ))}
                    <Pagination
                        style={{display: 'flex', justifyContent: 'center'}}
                        count={Math.ceil(data.articlesCount / ARTICLES_LIMIT_COUNT)}
                        shape="rounded"
                        color="primary"
                        onChange={paginationHandler}
                        page={parseInt(searchParams.get('page') || page, 10)}
                    />
                </>
            }
            {(!data?.articles.length && !isLoading) && <h2 style={{textAlign: 'center'}}>No articles :C</h2>}
        </>
    );
};

export default Articles;
