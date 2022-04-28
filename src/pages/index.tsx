import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
// import { string } from 'yup';

interface Image {
  id: string;
  title: string;
  description: string;
  url: string;
  ts: number;
}

interface GetImagesResponse {
  after: string;
  data: Image[];
}

export default function Home(): JSX.Element {
  async function getImages({ pageParam = null }): Promise<GetImagesResponse> {
    const { data } = await api('/api/images', {
      params: {
        after: pageParam,
      },
    });

    return data;
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    'images',
    // AXIOS REQUEST WITH PARAM
    getImages,
    // GET AND RETURN NEXT PAGE PARAM
    {
      getNextPageParam: lastPage => lastPage?.after || null,
    }
  );

  const formattedData = useMemo(() => {
    // FORMAT AND FLAT DATA ARRAY
    const finalData = data?.pages.flatMap(image => image.data.flat());
    return finalData;
  }, [data]);

  // RENDER LOADING SCREEN
  if (isLoading && !isError) {
    return <Loading />;
  }

  // RENDER ERROR SCREEN
  if (isError && !isLoading) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {
          /* TODO RENDER LOAD MORE BUTTON IF DATA HAS NEXT PAGE */
          hasNextPage && (
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              mt="6"
            >
              {!isFetchingNextPage ? 'Carregar mais' : 'Carregando...'}
            </Button>
          )
        }
      </Box>
    </>
  );
}
