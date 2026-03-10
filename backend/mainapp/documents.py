# from .models import ProductVariant
# from django_elasticsearch_dsl import Document, fields, Index
# from django_elasticsearch_dsl.registries import registry
# from django.conf import settings
# from elasticsearch_dsl import analyzer
# from elasticsearch_dsl.analysis import token_filter

# # Define the edge_ngram filter and analyzer
# edge_ngram_filter = token_filter(
#     'edge_ngram_filter',
#     type='edge_ngram',
#     min_gram=1,
#     max_gram=25
# )

# autocomplete_analyzer = analyzer(
#     'autocomplete',
#     tokenizer="standard",
#     filter=["lowercase", edge_ngram_filter]
# )

# autocomplete_search_analyzer = analyzer(
#     'autocomplete_search',
#     tokenizer="standard",
#     filter=["lowercase"]
# )


# @registry.register_document
# class ProductVariantDocument(Document):
#     product_title = fields.TextField(
#         attr='product_title',
#         analyzer=autocomplete_analyzer,
#         search_analyzer=autocomplete_search_analyzer
#     )
#     product_description = fields.TextField(
#         attr='product_description',
#         analyzer=autocomplete_analyzer,
#         search_analyzer=autocomplete_search_analyzer
#     )

#     class Index:
#         name = f"{getattr(settings, 'ELASTICSEARCH_INDEX_PREFIX', 'default')}_productvariants"
#         settings = {
#             'number_of_shards': 1,
#             'number_of_replicas': 0,
#             "analysis": {
#             "filter": {
#                 "edge_ngram_filter": {
#                     "type": "edge_ngram",
#                     "min_gram": 1,
#                     "max_gram": 20
#                 }
#             },
#             "analyzer": {
#                 "autocomplete": {
#                     "tokenizer": "standard",
#                     "filter": ["lowercase", "edge_ngram_filter"]
#                 },
#                 "autocomplete_search": {
#                     "tokenizer": "standard",
#                     "filter": ["lowercase"]
#                 }
#             }
#         }
#     }

#     class Django:
#         model = ProductVariant
#         fields = ['id', 'sku', 'price']

#     def prepare_product_title(self, instance):
#         return instance.product.title if instance.product else ""
