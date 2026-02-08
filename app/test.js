import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const TAB_OPTIONS = ['For You', 'Scenes', 'Featured', 'Groups'];
const PAGE_SIZE = 10;

const ProductCard = ({item}) => {
  return (
    <View style={styles.cardWrap}>
      <Image
        source={{uri: item.thumbnail}}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.cardSubtitle}>
          {item.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>${item.price}</Text>
          <Text style={styles.metaText}>Rating {item.rating}</Text>
        </View>
      </View>
    </View>
  );
};

const TestScreen = () => {
  const [activeTab, setActiveTab] = useState('For You');
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async ({skip = 0, append = false}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingInitial(true);
      }

      const response = await fetch(
        `https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}`,
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const nextProducts = Array.isArray(data.products) ? data.products : [];

      setTotalCount(data.total || 0);
      setProducts(prev => (append ? [...prev, ...nextProducts] : nextProducts));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts({skip: 0, append: false});
  }, [fetchProducts]);

  const loadNextPage = useCallback(() => {
    if (loadingInitial || loadingMore) {
      return;
    }

    if (products.length >= totalCount) {
      return;
    }

    fetchProducts({skip: products.length, append: true});
  }, [fetchProducts, loadingInitial, loadingMore, products.length, totalCount]);

  const renderTab = ({item}) => {
    const selected = item === activeTab;

    return (
      <Pressable
        onPress={() => setActiveTab(item)}
        style={[styles.tabPill, selected && styles.tabPillActive]}>
        <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>
          {item}
        </Text>
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return <View style={styles.footerSpacing} />;
    }

    return (
      <ActivityIndicator
        size="small"
        color="#ECECEE"
        style={styles.footerLoader}
      />
    );
  };

  if (loadingInitial) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.tabBar}>
          <FlatList
            data={TAB_OPTIONS}
            horizontal
            scrollEnabled
            bounces
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            renderItem={renderTab}
            contentContainerStyle={styles.tabRow}
          />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#ECECEE" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tabBar}>
        <FlatList
          data={TAB_OPTIONS}
          horizontal
          scrollEnabled
          bounces
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={renderTab}
          contentContainerStyle={styles.tabRow}
        />
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => <ProductCard item={item} />}
          scrollEnabled
          bounces
          alwaysBounceVertical
          directionalLockEnabled
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          ListFooterComponent={renderFooter}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>
                {error || 'No products available'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#07080B',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  list: {
    flex: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  tabRow: {
    paddingTop: 8,
    paddingBottom: 14,
  },
  tabBar: {
    height: 60,
  },
  listContainer: {
    flex: 1,
    minHeight: 0,
  },
  tabPill: {
    paddingHorizontal: 26,
    height: 38,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#3A3E47',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#090A0D',
  },
  tabPillActive: {
    backgroundColor: '#ECECEE',
    borderColor: '#ECECEE',
  },
  tabLabel: {
    color: '#B7B8BE',
    fontSize: 18,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#232427',
    fontWeight: '600',
  },
  cardWrap: {
    width: '48.5%',
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#181A1F',
  },
  cardImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#2B2E36',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#1A1C22',
  },
  cardTitle: {
    color: '#F3F4F6',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#B1B4BC',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: '#9DA1AA',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ECECEE',
    fontSize: 15,
  },
  footerLoader: {
    marginVertical: 16,
    alignSelf: 'center',
  },
  footerSpacing: {
    height: 18,
  },
});

export default TestScreen;
